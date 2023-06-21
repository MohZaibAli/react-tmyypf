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

const deepMap = (obj, depth = 1) => Object.entries(obj).map([oK, oV]);

function Row(props: { row: Permission }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell style={{ paddingLeft: 10 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
        <TableCell align="right">{row.protein}</TableCell>
        <TableCell align="right">{row.protein}</TableCell>
        <TableCell align="right">{row.protein}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0, borderBottom: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table aria-label="collapsible table">
              <TableBody>
                {rows.map((row) => (
                  <Row key={row.name} row={row} />
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
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
        console.log(Permissions);
      });
  }, []);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Dessert (100g serving)</TableCell>
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
