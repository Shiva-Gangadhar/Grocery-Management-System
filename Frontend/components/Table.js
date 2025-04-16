import React, { useState } from 'react';
import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const Table = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  defaultSort = { field: 'id', direction: 'asc' },
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sort, setSort] = useState(defaultSort);

  // Handle sort
  const handleSort = (field) => {
    const isAsc = sort.field === field && sort.direction === 'asc';
    setSort({
      field,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  // Sort function
  const sortData = (a, b) => {
    const { field, direction } = sort;
    const valueA = a[field];
    const valueB = b[field];

    if (valueA === valueB) return 0;
    
    const comparison = valueA < valueB ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get sorted and paginated data
  const sortedData = [...data].sort(sortData);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer>
        <MuiTable>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sortDirection={sort.field === column.field ? sort.direction : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sort.field === column.field}
                      direction={sort.field === column.field ? sort.direction : 'asc'}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow key={row.id || index}>
                  {columns.map(column => (
                    <TableCell key={column.field} align={column.align || 'left'}>
                      {column.render ? column.render(row[column.field], row) : row[column.field]}
                    </TableCell>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {onView && (
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => onView(row)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => onEdit(row)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => onDelete(row)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                  align="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default Table;