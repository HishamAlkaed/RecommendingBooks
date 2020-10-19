
import React, { useEffect, useState, forwardRef } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';

import Header from '../components/Header';
import { Card, CardContent, CircularProgress, LinearProgress, Typography } from '@material-ui/core';
import axios from 'axios';
import { authors_static } from '../components/Authors';
import MaterialTable from 'material-table';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    margin: 5,
  },
  paper: {
    height: 140,
    width: 100,
    background: '#d8eefe',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

function Books(props) {
  const classes = useStyles();
  const [meta, setMeta] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);


  useEffect(() => {
    // const mySparqlEndpoint = "http://dbpedia.org/sparql/";
    const mySparqlEndpoint = "http://192.168.56.1:7200/repositories/project";
      // FILTER (lang(?label) = "en")
    let query = `
    SELECT ${props.location.state.books.map((_, i) => `?${i}_author`).join(' ')}
      ${props.location.state.books.map((book, i) => `(count(DISTINCT ?${i}_similar) as ?${i}_count)`).join(' ')}
    
  WHERE
    { 
      ${props.location.state.books.map((book, i) => `dbr:` + book.value + ` dbo:author ?${i}_author .`).join('\n')}
      ${props.location.state.books.map((book, i) => `dbr:` + book.value + ` owl:sameAs ?${i}_similar .`).join('\n')}
    }
    `;
    console.log(props.history.location.state.genres[0].label)
    query = `
      PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
      select ?title ?genre_title ?author_name ?rating where { 
        ?book a ol:${props.history.location.state.genres[0].label.replace(' ', '_')} ;
            ol:has_title ?title ;
            ol:has_author ?author ;
      	    ol:has_rating ?rating .
          ?author owl:NamedIndividual ?author_name .
          ol:${props.history.location.state.genres[0].label.replace(' ', '_')}  ol:has_genre_name ?genre_title .
      } limit 1500
    `;

    axios.get(window.encodeURI(`${mySparqlEndpoint}?query=${query}`))
    .then((response) => {
      console.log(response)
      const {bindings} = response.data.results;
      let result = []
      bindings.forEach(b => {
        const {title, author_name, genre_title, rating} = b;

        result.push({title: title.value, author: author_name.value, count: 0, genre_title: genre_title.value, rating: rating.value });
        // result = props.location.state.books.map((book, i) => ({title: book.value, author: b[i + '_author'].value, count: b[i + '_count'].value}))
      })
      // console.log(result)
      setMeta(result)
      setTimeout(setLoadingBooks, 500);
      })
      .catch((error) => {
        console.log(`Error calling SPARQL for population: ${error.response.data}`);
        return error.response.data;
      });
  }, [])

  return (
    <React.Fragment>
      <Header />
      {loadingBooks && <LinearProgress />}

      {/* TODO: choose a table or cards (if cards, then stack them 3 in a row) */}
      <MaterialTable
        icons={tableIcons}
        columns={[
          { title: 'Author', field: 'author' },
          { title: 'Genre', field: 'genre_title' },
          { title: 'Rating', field: 'rating', type: 'numeric' },
          { title: 'Similar to', field: 'count' }
        ]}
        data={meta}
        title="Books Recommendation"
        isLoading={loadingBooks}
        options={{
          headerStyle: {
            backgroundColor: '#01579b',
            color: '#FFF'
          }
        }}
      />
      {props.location.state && Object.keys(props.location.state).map(entry => {
        let content;
        if (entry === 'books') {
          content = meta && meta.sort((a, b) => b.rating - a.rating).map((v, i) => {
            return (<Card key={Math.random()} className={classes.root}>
              <CardContent>
                <Typography variant="h5" component="h2">{v.title}</Typography>
                <Typography className={classes.pos} color="textSecondary">
                  {i} Author: {v.author}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Genre: {v.genre_title}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Rating: {v.rating}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Similar to book: {v.count}
                </Typography>
              </CardContent>
            </Card>)
          })
        }

        return <Grid container alignContent="center" direction="column" key={entry}>
          {props.location.state[entry].length > 0 && <h3>{entry.toUpperCase()}</h3>}
          {content}
        </Grid>
      })}
    </React.Fragment>
  );
}
export default withRouter(Books)