import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { TableCell as MuiTableCell } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/system';

const TableCell = styled(MuiTableCell)({
  width: '12.5%',
});

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

const deepMap = (obj: Object, depth = 1, parentId?: string): Permission[] =>
  Object.entries(obj).map(([oK, oV]: any) => ({
    depth,
    id: parentId ? `${parentId}.${oK}` : oK,
    ...(oV.id && { permissionId: oV.id }),
    name: oV.name || oK.replace(/([a-z])([A-Z])/g, '$1 $2'),
    ...(!oV.permission && {
      children: deepMap(oV, depth + 1, parentId ? `${parentId}.${oK}` : oK),
    }),
    permission: {
      add: false,
      view: false,
      edit: false,
      edit_own: false,
      delete: false,
      delete_own: false,
    },
  }));

const deepUpdate = (
  permissions: Permission[],
  id: string,
  status: boolean,
  parentI?: number
): Permission[] => {
  let updatedPermissions = structuredClone(permissions);
  let depths: string[] = id.split('.');
  let operation: keyof Permission['permission'] = depths
    .splice(-1, 1)
    .toString() as any;
  let oK: any;
  let found;
  for (oK in permissions) {
    let oV = permissions[oK];
    let depthId = depths.slice(0, oV.depth).join('.');
    found = oV.id === depthId || oV.id.startsWith(`${depthId}.`);
    if (found) {
      if (oV.children) {
        updatedPermissions[oK].children = deepUpdate(
          oV.children,
          id,
          status,
          oK
        );
        console.log(
          depthId,
          status,
          updatedPermissions[oK].children?.map((c) => c.permission[operation]),
          updatedPermissions[oK]
            .children!.map((c) => c.permission[operation])
            .every((s) => s === status)
        );
        updatedPermissions[oK].permission[operation] = updatedPermissions[oK]
          .children!.map((c) => c.permission[operation])
          .every((s) => s === status);
      } else {
        updatedPermissions[oK].permission[operation] = status;
      }
      if (parentI == undefined) {
        break;
      }
    }
  }
  return updatedPermissions;
};

function Row(props: { row: Permission; handleChange: any }) {
  const { row, handleChange } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        {row?.children?.length ? (
          <TableCell
            sx={{ width: '5%' }}
            style={{ paddingLeft: row.depth * 15 }}
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
          <TableCell sx={{ width: '5%' }} />
        )}
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="center">
          <Checkbox
            id={`${row.id}.add`}
            onChange={handleChange}
            checked={row.permission.add}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            id={`${row.id}.view`}
            onChange={handleChange}
            checked={row.permission.view}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            id={`${row.id}.edit`}
            onChange={handleChange}
            checked={row.permission.edit}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            id={`${row.id}.edit_own`}
            onChange={handleChange}
            checked={row.permission.edit_own}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            id={`${row.id}.delete`}
            onChange={handleChange}
            checked={row.permission.delete}
          />
        </TableCell>
        <TableCell align="center">
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
                    <Row key={i} row={permission} handleChange={handleChange} />
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
  const [permissions, setPermissions] = React.useState<Permission[]>([]);

  React.useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/MohZaibAli/react-tmyypf/main/data.json'
    )
      .then((data) => data.json())
      .then((response) => {
        let Permissions = deepMap(response);
        setPermissions(Permissions);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let updatedPermissions = deepUpdate(
      permissions,
      e.target.id,
      e.target.checked
    );
    setPermissions(updatedPermissions);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }} />
            <TableCell>Name</TableCell>
            <TableCell align="center">Add</TableCell>
            <TableCell align="center">View</TableCell>
            <TableCell align="center">Edit</TableCell>
            <TableCell align="center">Edit Own</TableCell>
            <TableCell align="center">Delete</TableCell>
            <TableCell align="center">Delete Own</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {permissions.map((permission, i) => (
            <Row key={i} row={permission} handleChange={handleChange} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
