import React, { useEffect, useState } from 'react';
import { fetchBooks, fetchAuthorDetails } from '../services/api';
import ReactPaginate from 'react-paginate';
import { useTable, useSortBy } from 'react-table';
import { CSVLink } from 'react-csv';
import 'tailwindcss/tailwind.css';

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchAuthor, setSearchAuthor] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const books = await fetchBooks(page, limit);
        const booksWithAuthors = await Promise.all(
          books.map(async (book) => {
            let authorDetails = {};
            if (book.author_key && book.author_key.length > 0) {
              authorDetails = await fetchAuthorDetails(book.author_key[0]);
            }
            return {
              title: book.title,
              first_publish_year: book.first_publish_year,
              subject: book.subject ? book.subject.slice(0, 3).join(', ') : 'N/A',
              ratings_average: book.ratings_average || 'N/A',
              author_name: authorDetails.name || 'N/A',
              author_birth_date: authorDetails.birth_date || 'N/A',
              author_top_work: authorDetails.top_work || 'N/A',
            };
          })
        );
        console.log('Books with Authors:', booksWithAuthors);
        setData(booksWithAuthors);
        setOriginalData(booksWithAuthors);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page, limit]);

  useEffect(() => {
    if (searchAuthor === '') {
      setData(originalData);
      return;
    }
    const filteredData = originalData.filter(book =>
      book.author_name.toLowerCase().includes(searchAuthor.toLowerCase())
    );
    setData(filteredData);
  }, [searchAuthor, originalData]);

  const columns = React.useMemo(
    () => [
      { Header: 'Title', accessor: 'title' },
      { Header: 'Author', accessor: 'author_name' },
      { Header: 'First Publish Year', accessor: 'first_publish_year' },
      { Header: 'Subject', accessor: 'subject' },
      { Header: 'Author Birth Date', accessor: 'author_birth_date' },
      { Header: 'Author Top Work', accessor: 'author_top_work' },
      { Header: 'Average Rating', accessor: 'ratings_average' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">Admin Dashboard</h1>
      <div className="mb-8 flex justify-between items-center">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700">
            Records per page:
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="w-1/2 pl-4">
          <label className="block text-sm font-medium text-gray-700">
            Search by Author:
          </label>
          <input
            type="text"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
            placeholder="Enter author name"
          />
        </div>
      </div>
      <CSVLink data={data} filename={"books.csv"} className='hover:text-blue-500'>
        Download CSV
      </CSVLink>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table {...getTableProps()} className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-700"
                  >
                    {column.render('Header')}
                    <span className="ml-1">
                      {column.isSorted ? (column.isSortedDesc ? '🔽' : '🔼') : ' ⇅'}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
        <div className="mt-4  ">
        <ReactPaginate
          previousLabel={'Previous '}
          nextLabel={'Next'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={Math.ceil(1000 / limit)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={(data) => setPage(data.selected + 1)}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          className="flex justify-center space-x-2"
          activeClassName={'text-blue-900 font-bold'}
         previousClassName={'hover:text-blue-500'}
         nextClassName={'hover:text-blue-500'}
         pageClassName={'hover:text-blue-500'}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
