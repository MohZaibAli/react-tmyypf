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

const deepMap = (obj: Object, depth = 1): Permission[] =>
  Object.entries(obj).map(([oK, oV]: any) => ({
    depth,
    id: oV.id,
    name: oV.name || oK.replace(/([a-z])([A-Z])/g, '$1 $2'),
    ...(!oV.permission && { children: deepMap(oV, depth + 1) }),
    permission: {
      add: true,
      view: false,
      edit: true,
      edit_own: false,
      delete: false,
      delete_own: false,
    },
  }));

function Row(props: { row: Permission }) {
  const { row } = props;
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
          <Checkbox checked={row.permission.add} />
        </TableCell>
        <TableCell align="center">
          <Checkbox checked={row.permission.view} />
        </TableCell>
        <TableCell align="center">
          <Checkbox checked={row.permission.edit} />
        </TableCell>
        <TableCell align="center">
          <Checkbox checked={row.permission.edit_own} />
        </TableCell>
        <TableCell align="center">
          <Checkbox checked={row.permission.delete} />
        </TableCell>
        <TableCell align="center">
          <Checkbox checked={row.permission.delete_own} />
        </TableCell>
      </TableRow>
      {row?.children?.length && (
        <TableRow>
          <TableCell style={{ padding: 0, borderBottom: 0 }} colSpan={8}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table aria-label="collapsible table">
                <TableBody>
                  {row?.children?.map((permission, i) => (
                    <Row key={i} row={permission} />
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
        console.log(Permissions);
      });
  }, []);
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
            <Row key={i} row={permission} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
