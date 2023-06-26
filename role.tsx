import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowUpIcon,
  KeyboardArrowDownIcon,
} from '@mui/icons-material';
import { debounce } from './utils';

type Permission = {
  id: string;
  permissionId: string;
  depth: number;
  name: string;
  children?: Permission[];
  permission: {
    add: boolean;
    view: boolean;
    edit: boolean;
    edit_own: boolean;
    delete: boolean;
    delete_own: boolean;
  };
};

let permissionIds: string[] = [];

const deepMap = async (
  obj: Object,
  depth = 1,
  parentId?: string
): Promise<Permission[]> =>
  await Promise.all(
    Object.entries(obj).map(async ([oK, oV]: any) => {
      let children: Permission[] | undefined;
      let permissionObj: Permission['permission'] = {
        add: oV.permission?.add || false,
        view: oV.permission?.view || false,
        edit: oV.permission?.edit || false,
        edit_own: oV.permission?.edit_own || false,
        delete: oV.permission?.delete || false,
        delete_own: oV.permission?.delete_own || false,
      };

      if (!oV.permission) {
        children = await deepMap(
          oV,
          depth + 1,
          parentId ? `${parentId}.${oK}` : oK
        );
        Object.keys(permissionObj).forEach((pK) => {
          permissionObj[pK as keyof Permission['permission']] = children!.every(
            (c) => c.permission[pK as keyof Permission['permission']] === true
          );
        });
      }
      return {
        depth,
        id: parentId ? `${parentId}.${oK}` : oK,
        ...(oV.id && { permissionId: oV.id }),
        name: oV.name || oK.replace(/([a-z])([A-Z])/g, '$1 $2'),
        ...(children && {
          children,
        }),
        permission: permissionObj,
      };
    })
  );

const deepUpdate = async (
  _permissions: Permission[],
  id: string,
  status: boolean,
  parentI?: number
): Promise<Permission[]> => {
  const updatedPermissions = [..._permissions];
  const depths: string[] = id.split('.');
  const operation: keyof Permission['permission'] = depths
    .splice(-1, 1)
    .toString() as any;

  let found = false;
  for (let i = 0; i < updatedPermissions.length; i++) {
    const oV = updatedPermissions[i];
    const depthId = depths.slice(0, oV.depth).join('.');
    found = oV.id === depthId || oV.id.startsWith(`${depthId}.`);

    if (found) {
      if (oV.children) {
        updatedPermissions[i].children = await deepUpdate(
          oV.children,
          id,
          status,
          i
        );
        updatedPermissions[i].permission[operation] =
          updatedPermissions[i].children!.every(
            (c) => c.permission[operation] === status
          ) && status;
      } else {
        updatedPermissions[i].permission[operation] = status;
      }

      if (updatedPermissions[i].permissionId) {
        const permissionId = `${updatedPermissions[i].permissionId}.${operation}`;
        // if (status) {
        permissionIds.push(permissionId);
        // } else {
        //   const index = permissionIds.indexOf(permissionId);
        //   if (index !== -1) {
        //     permissionIds.splice(index, 1);
        //   }
        // }
      }

      if (parentI === undefined) {
        break;
      }
    }
  }

  return updatedPermissions;
};

function Row(props: { row: Permission; handleChange: any }) {
  const { row, handleChange } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {row?.children?.length ? (
          <TableCell
            sx={{
              '&': {
                width: '5%',
                paddingLeft: {
                  md: `${row.depth * 15}px`,
                },
              },
            }}
          >
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        ) : (
          <TableCell style={{ width: '5%' }} />
        )}
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.add`}
            onChange={handleChange}
            checked={row.permission.add}
          />
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.view`}
            onChange={handleChange}
            checked={row.permission.view}
          />
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.edit`}
            onChange={handleChange}
            checked={row.permission.edit}
          />
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.edit_own`}
            onChange={handleChange}
            checked={row.permission.edit_own}
          />
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.delete`}
            onChange={handleChange}
            checked={row.permission.delete}
          />
        </TableCell>
        <TableCell align="center" style={{ width: '10%' }}>
          <Checkbox
            id={`${row.id}.delete_own`}
            onChange={handleChange}
            checked={row.permission.delete_own}
          />
        </TableCell>
      </TableRow>
      {row?.children?.length && (
        <TableRow>
          <TableCell style={{ padding: 0, borderBottom: 0 }} colSpan={8}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table aria-label="collapsible table">
                <TableBody>
                  {row?.children?.map((permission, i) => (
                    <Row
                      key={permission.id}
                      row={permission}
                      handleChange={handleChange}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export default function CollapsibleTable() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/MohZaibAli/react-tmyypf/main/data.json'
        );
        const data = await response.json();
        const Permissions = await deepMap(data);
        setPermissions(Permissions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    permissionIds.length && setLoading(false);
  }, [loading]);

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      permissionIds = [];
      setLoading(true);
      const updatedPermissions = await deepUpdate(
        permissions,
        e.target.id,
        e.target.checked
      );
      setPermissions(updatedPermissions);
    },
    [permissions]
  );

  return (
    <TableContainer sx={{ maxHeight: '98vh' }} component={Paper}>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '5%' }} />
            <TableCell>Name</TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              Add
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              View
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              Edit
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              Edit Own
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              Delete
            </TableCell>
            <TableCell align="center" style={{ width: '10%' }}>
              Delete Own
            </TableCell>
          </TableRow>
        </TableHead>
        {!loading && permissions ? (
          <TableBody>
            {permissions.map((permission) => (
              <Row
                key={permission.id}
                row={permission}
                handleChange={handleChange}
              />
            ))}
          </TableBody>
        ) : (
          <CircularProgress />
        )}
      </Table>
    </TableContainer>
  );
}
