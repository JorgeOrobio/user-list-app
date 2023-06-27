import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash';


const Home = () => {
    const [data, setData] = useState({ results: [] })
    const [renderedData, setRenderedData] = useState({ results: [] })
    const tableRef = useRef(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterText, setFilterText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [sortOrderTable, setSortOrderTable] = useState({ first: 'asc', last: 'asc', country: 'asc' });

    const columns = [
        { id: 'thumbnail', label: 'Foto', align: "center" },
        { id: 'first', label: 'Nombre', align: "center" },
        { id: 'last', label: 'Apellido', align: "center" },
        { id: 'country', label: 'Pais', align: "center" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            let url = "https://randomuser.me/api/?page=1&results=100";
            let options = {
                method: "GET",
            };

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                console.log("Datos consultados: ",data);
                setData(data);
                setRenderedData(data);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const filteredCountries = renderedData.results.filter((row) => {
                return row.location.country.toLowerCase().includes(filterText.toLowerCase())
            }
            );
            setFilteredData(filteredCountries);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filterText, renderedData]);


    const handleInputChange = (event) => {
        setFilterText(event.target.value);
    };

    const deleteFromRenderView = (e, rowToDelete) => {
        const updatedData = renderedData.results.filter((row) => row.id.value !== rowToDelete.id.value);
        setRenderedData({ ...renderedData, results: updatedData });
    }

    const setTableBgColor = () => {
        const table = tableRef.current;

        if (table) {
            table.classList.toggle('colorful');
        }
    }

    const handleSortByCountry = () => {
        const sortedData = [...renderedData.results].sort((a, b) => {
            const comparison = a.location.country.localeCompare(b.location.country)
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        setRenderedData({ ...sortedData, results: sortedData });
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const restoreInitialState = () => {
        setRenderedData(data);
    }

    const handleSortByColumn = (column) => {
        const sortConfig = {
          first: { field: 'name.first' },
          last: { field: 'name.last' },
          country: { field: 'location.country' },
        };
      
        const { field } = sortConfig[column.id];
        const comparison = (a, b) => {
          const valueA = _.get(a, field);
          const valueB = _.get(b, field);
          return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        };
      
        const sortedData = [...renderedData.results].sort(comparison);
        setRenderedData({ ...renderedData, results: sortedData });
      
        const newSortOrderTable = {
          ...sortOrderTable,
          [column.id]: sortOrderTable[column.id] === 'asc' ? 'desc' : 'asc',
        };
        setSortOrderTable(newSortOrderTable);
      };

    return (
        <section>
            <div className='container'>
                <button className='button' onClick={(e) => { setTableBgColor() }}> Colorear filas </button>
                <button className='button' onClick={(e) => { handleSortByCountry() }}> Ordenar por país</button>
                <button className='button' onClick={(e) => { restoreInitialState() }}> Restaurar estado inicial</button>
                <input className='input' value={filterText} onChange={handleInputChange} type='text' placeholder='Filtrar por país' />
            </div>
            <table className='table' ref={tableRef}>
                <thead>
                    <tr>
                        {columns.map(column => {
                            return (
                                <th onClick={(e) => { handleSortByColumn(column) }} id={column.id} key={column.id}>
                                    {column.label}
                                </th>
                            )
                        })}
                        <th id='actions'> Actions </th>
                    </tr>
                </thead>
                <tbody>
                    {filterText !== "" ?
                        filteredData.map((row, index) => {
                            return (
                                <tr key={index}>
                                    <td><img className="profile-image" src={row.picture.thumbnail} alt={row.name.first + 'img'} /> </td>
                                    <td>{row.name.first}</td>
                                    <td>{row.name.last}</td>
                                    <td>{row.location.country}</td>
                                    <td><button className='button-red' onClick={(e) => { deleteFromRenderView(e, row) }}> Delete</button></td>
                                </tr>
                            )
                        })
                        : renderedData.results.map((row, index) => {
                            return (
                                <tr key={index}>
                                    <td><img className="profile-image" src={row.picture.thumbnail} alt={row.name.first + 'img'} /> </td>
                                    <td>{row.name.first}</td>
                                    <td>{row.name.last}</td>
                                    <td>{row.location.country}</td>
                                    <td><button className='button-red' onClick={(e) => { deleteFromRenderView(e, row) }}> Delete</button></td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </section>
    )
}

export default Home
