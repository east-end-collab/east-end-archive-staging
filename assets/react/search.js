class ItemsJS extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      configuration: {
        searchableFields: ['Last_Name[505602]', 'First_Name[505603]', 'Birth_Year[505610]', "Middle_Name[505604]", "Cemetery Name[532988]"],
        sortings: {
          name_asc: {
            field: 'Last_Name[505602]',
            order: 'asc'
          }
        },
        aggregations: {
          "Birth_Year[505610]": {
            title: 'Birth Year',
            size: 10
          },
          "Death_Year[505613]": {
            title: 'Death Year',
            size: 10
          },
          "Death_Primary[505614]": {
            title: 'Primary Cause of Death',
            size: 10
          },
          "Death_Secondary[505615]": {
            title: 'Secondary Cause of Death',
            size: 10
          },
          "Cemetery Name[532988]": {
            title: 'Cemetary',
            size: 10
          },
        }
      }
    }
    
    
    var newFilters = {};
    Object.keys(this.state.configuration.aggregations).map(function (v) {
      newFilters[v] = [];
    })

    
    // const data = airtable.records.map(record => {
    //   return record.fields
    // });
    

    
    // Copying this.state using the spread op (...this.state)
    this.state = {
      ...this.state,
      // the rows comes from external resources
      // https://github.com/itemsapi/itemsapi-example-data/blob/master/jsfiddle/imdb.js
      
      // In React line below is:
      //itemsjs: require('itemsjs')(rows, this.state.configuration),
      itemsjs: itemsjs(airtable, this.state.configuration),

      query: '',
      filters: newFilters,
    }
  }

  changeQuery(e) {
    this.setState({
      query: e.target.value
    });
  }

  reset() {
    var newFilters = {};
    Object.keys(this.state.configuration.aggregations).map(function (v) {
      newFilters[v] = [];
    })
    this.setState({
      filters: newFilters,
      query: '',
    })
  }

  handleCheckbox = (filterName, filterValue) => event => {
    const oldFilters = this.state.filters;
    console.log("oldFilters", oldFilters)
    let newFilters = oldFilters
    let check = event.target.checked;
    console.log("filterName", "filterValue")
    console.log(typeof(filterName), typeof(filterValue))
    if (check) {
      newFilters[filterName].push(filterValue)

      this.setState({
        filters: newFilters
      })
    } else {
      var index = newFilters[filterName].indexOf(filterValue);
      if (index > -1) {
        newFilters[filterName].splice(index, 1);
        this.setState({
          filters: newFilters
        })
      }
    }
  }

  get searchResult() {

    var result = this.state.itemsjs.search({
      query: this.state.query,
      filters: this.state.filters,
      per_page: 50
    })
    console.log(result);
    
    return result
  }
;
  

  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand" href="#" onClick={this.reset.bind(this)}>ItemsJS movies</a>
            </div>
            <div id="navbar">
              <form className="navbar-form navbar-left">
                <div className="form-group">
                  <input type="text" value={this.state.query} onChange={this.changeQuery.bind(this)} className="form-control" placeholder="Search" />

                </div>
              </form>
            </div>
          </div>
        </nav>

        <div className="container" style={{ marginTop: '50px' }}>

          <h1>List of items ({this.searchResult.pagination.total})</h1>

          <p className="text-muted">Search performed in {this.searchResult.timings.search} ms, facets in {this.searchResult.timings.facets} ms</p>

          <div className="row">
            <div className="col-md-2 col-xs-2">
              {
                Object.entries(this.searchResult.data.aggregations).map(([key, value]) => {
                  return (
                    <div key={key}>
                      <h5 style={{ marginBottom: '5px' }}><strong style={{ color: '#337ab7' }}>{value.title}</strong></h5>

                      <ul className="browse-list list-unstyled long-list" style={{ marginBottom: '0px' }}>
                        {
                          Object.entries(value.buckets).map(([keyB, valueB]) => {
                            return (
                              <li key={valueB.key}>
                                <div className="checkbox block" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                  <label>
                                    <input className="checkbox" type="checkbox" checked={this.state.filters[value.name].indexOf(valueB.key)>-1 || false} onChange={this.handleCheckbox(value.name, valueB.key)} />
                                    {valueB.key} ({valueB.doc_count})
                                  </label>
                                </div>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  )
                })
              }
            </div>
            <div className="col-md-10 col-xs-10">
            <div className="breadcrumbs"></div>
            <div className="clearfix"></div>
            <table className="table table-striped">
              <tbody>
                <tr>
                  <th>image</th>
                  <th>Find a Grave Link</th>
                  <th>Name</th>
                  <th>Birth - Death</th>
                  <th>Cemetary Name</th>
                </tr>
              {
              Object.entries(this.searchResult.data.items).map(([key, item]) => {
                // console.log(item);
                let birthYear = item["Birth_Year[505610]"] ? item["Birth_Year[505610]"] : "?"
                let deathYear = item["Death_Year[505613]"] ? item["Death_Year[505613]"] : "?"
                let findGraveUrl = item["FindGraveURL[505600]"] ? item["FindGraveURL[505600]"] : null
                let middleName = item["Middle_Name[505604]"] ? item["Middle_Name[505604]"] : ""
                return (
                <tr key={key}>
                  <td><img style={{width: '100px'}} src={item["Media URL"]} /></td>
                  <td>{findGraveUrl ? <a target="_blank" href={findGraveUrl}>Find-A-Grave</a> : "" }</td>
                  <td>
                    <b>{`${item["First_Name[505603]"]} ${middleName} ${item["Last_Name[505602]"]}`} </b>
                    <br />
                    {item.description}
                  </td>
                  <td>
                    <span >{ `${birthYear} - ${deathYear}` }</span>
                  </td>
                  <td>
                    {item["Cemetery Name[532988]"]}
                  </td>
                </tr>)})
              }
              </tbody>
            </table>
            <div className="clearfix"></div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <ItemsJS />,
  document.getElementById('react_search_container')
);


// class ItemsJS extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       configuration: {
//         searchableFields: ['title', 'tags', 'actors'],
//         sortings: {
//           name_asc: {
//             field: 'name',
//             order: 'asc'
//           }
//         },
//         aggregations: {
//           tags: {
//             title: 'Tags',
//             size: 10
//           },
//           actors: {
//             title: 'Actors',
//             size: 10
//           },
//           genres: {
//             title: 'Genres',
//             size: 10
//           },
//           runtime: {
//             title: 'Runtime',
//             size: 10
//           }
//         }
//       }
//     }

//     var newFilters = {};
//     Object.keys(this.state.configuration.aggregations).map(function (v) {
//       newFilters[v] = [];
//     })

//     // Copying this.state using the spread op (...this.state)
//     this.state = {
//       ...this.state,
//       // the rows comes from external resources
//       // https://github.com/itemsapi/itemsapi-example-data/blob/master/jsfiddle/imdb.js
      
//       // In React line below is:
//       //itemsjs: require('itemsjs')(rows, this.state.configuration),
//       itemsjs: itemsjs(rows, this.state.configuration),

//       query: '',
//       filters: newFilters,
//     }
//   }

//   changeQuery(e) {
//     this.setState({
//       query: e.target.value
//     });
//   }

//   reset() {
//     var newFilters = {};
//     Object.keys(this.state.configuration.aggregations).map(function (v) {
//       newFilters[v] = [];
//     })
//     this.setState({
//       filters: newFilters,
//       query: '',
//     })
//   }

//   handleCheckbox = (filterName, filterValue) => event => {
//     const oldFilters = this.state.filters;
//     let newFilters = oldFilters
//     let check = event.target.checked;

//     if (check) {
//       newFilters[filterName].push(filterValue)

//       this.setState({
//         filters: newFilters
//       })
//     } else {
//       var index = newFilters[filterName].indexOf(filterValue);
//       if (index > -1) {
//         newFilters[filterName].splice(index, 1);
//         this.setState({
//           filters: newFilters
//         })
//       }
//     }
//   }

//   get searchResult() {

//     var result = this.state.itemsjs.search({
//       query: this.state.query,
//       filters: this.state.filters
//     })
//     console.log(result);
//     return result
//   }


//   render() {
//     return (
//       <div>
//         <nav className="navbar navbar-default navbar-fixed-top">
//           <div className="container">
//             <div className="navbar-header">
//               <a className="navbar-brand" href="#" onClick={this.reset.bind(this)}>ItemsJS movies</a>
//             </div>
//             <div id="navbar">
//               <form className="navbar-form navbar-left">
//                 <div className="form-group">
//                   <input type="text" value={this.state.query} onChange={this.changeQuery.bind(this)} className="form-control" placeholder="Search" />

//                 </div>
//               </form>
//             </div>
//           </div>
//         </nav>

//         <div className="container" style={{ marginTop: '50px' }}>

//           <h1>List of items ({this.searchResult.pagination.total})</h1>

//           <p className="text-muted">Search performed in {this.searchResult.timings.search} ms, facets in {this.searchResult.timings.facets} ms</p>

//           <div className="row">
//             <div className="col-md-2 col-xs-2">
//               {
//                 Object.entries(this.searchResult.data.aggregations).map(([key, value]) => {
//                   return (
//                     <div key={key}>
//                       <h5 style={{ marginBottom: '5px' }}><strong style={{ color: '#337ab7' }}>{value.title}</strong></h5>

//                       <ul className="browse-list list-unstyled long-list" style={{ marginBottom: '0px' }}>
//                         {
//                           Object.entries(value.buckets).map(([keyB, valueB]) => {
//                             return (
//                               <li key={valueB.key}>
//                                 <div className="checkbox block" style={{ marginTop: '0px', marginBottom: '0px' }}>
//                                   <label>
//                                     <input className="checkbox" type="checkbox" checked={this.state.filters[value.name].indexOf(valueB.key)>-1 || false} onChange={this.handleCheckbox(value.name, valueB.key)} />
//                                     {valueB.key} ({valueB.doc_count})
//                                   </label>
//                                 </div>
//                               </li>
//                             )
//                           })
//                         }
//                       </ul>
//                     </div>
//                   )
//                 })
//               }
//             </div>
//             <div className="col-md-10 col-xs-10">
//             <div className="breadcrumbs"></div>
//             <div className="clearfix"></div>
//             <table className="table table-striped">
//               <tbody>
//               {
//               Object.entries(this.searchResult.data.items).map(([key, item]) => {
//                 return (
//                 <tr key={key}>
//                   <td><img style={{width: '100px'}} src={item.image} /></td>
//                   <td></td>
//                   <td>
//                     <b>{item.name}</b>
//                     <br />
//                     {item.description}
//                   </td>
//                   <td></td>
//                   <td>
//                   {
//                     item.tags.map((tag, index) => {
//                       return (
//                         <span key={index}>{ tag }</span>
//                       )})
//                       }
//                   </td>
//                 </tr>)})
//               }
//               </tbody>
//             </table>
//             <div className="clearfix"></div>
//           </div>
//           </div>
//         </div>
//       </div>
//     )
//   }
// }

// ReactDOM.render(
//   <ItemsJS />,
//   document.getElementById('react_search_container')
// );