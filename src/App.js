import React, { Component } from 'react';
import { Container, Grid, Menu, Divider } from 'semantic-ui-react'
import Papa from 'papaparse';
import axios from 'axios'
import Chart from './Components/Chart';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

const {countries } = require('./countries')
const hopkins_confirmed =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const hopkins_deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const owid_tests_date = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/csv'
const owid_test_m = 'https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/COVID-19%20Tests%20per%20million%20people/COVID-19%20Tests%20per%20million%20people.csv'
  

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmedData: null,
      refreshing: false,
      pyacccases: 475,
      pyTests: 278,
      pydeath: 1,
      totalDeaths: 1,
      totalConfirmed: 1,
      srcSelector: 'confirmed'
    };
  }

  getMaxRange() {
    if (this.state.srcSelector === 'deaths') {
      return this.state.pydeath
    } else {
      return this.state.pyacccases
    }
  }

  changeDataSrc = (e, { id }) => { this.setState({ srcSelector: id }) }

  transformData = (data, countries, fields, selector) => {
    
    data = (data.filter(row => countries.map(country => country.key ).indexOf(row['Country/Region']) >= 0 && countries.map(country => country[selector] ) ) )
    let  new_data = []
    
    fields.slice(4, fields.length).forEach( field => {
      let new_row = { name: field, amt: 1500 }
      data.map(r => {
        new_row[r['Country/Region']] = r[field]
      })
      new_data.push(new_row)
    });
    
    return new_data
  }

  getTestData = (url) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: results => {  

        const {
          meta: { fields }
        } = results;
        
        const countryKeys = countries.map(country => country.key)
        this.setState({
          accTests: results.data.filter(row => countryKeys.indexOf(row['Entity']) >= 0 )
        })
        //    const countryKeys = countries.map(country => country.key)
        // const exclusiveData = results.data.filter(row => countryKeys.indexOf(row['Country/Region']) >= 0 )
      }})
      
  }

  maxCases(data, date, country){
    return (data.filter(row => row['Country/Region'] === country))[0][date]

  }

  getInfectedData(src) {
    Papa.parse(src, {
      download: true,
      header: true,
      complete: results => {  

        const {
          meta: { fields }
        } = results;
        // const { refreshing } = this.state;
        const lastColumn = fields[fields.length - 1];
        let sumConfirmed = 0
        for(var i = 0; i < results.data.length-1; i++){
          sumConfirmed = sumConfirmed + parseInt(results.data[i][lastColumn])
        }
        let newSumConfirmed = this.FormatNum(sumConfirmed)
        // if (refreshing === true) { 
        //   console.log("Updated via pull-to-refresh")
        // }
        const countryKeys = countries.map(country => country.key)
        const exclusiveData = results.data.filter(row => countryKeys.indexOf(row['Country/Region']) >= 0 )
        // console.log(exclusiveData)
        this.setState({
          date: lastColumn,
          refreshing: false,
          confirmedData: exclusiveData,
          similarIData: this.transformData(results.data, countries, fields.slice(50, fields.length), 'similar'),
          wdIData: this.transformData(results.data, countries, fields.slice(35, fields.length), 'wd' ),
          optionIData: this.transformData(results.data, countries, fields.slice(40, fields.length), 'option'),
          earlyIData: this.transformData(results.data, countries, fields.slice(55, fields.length), 'early'),
          pyacccases: this.maxCases(results.data, lastColumn, "Paraguay"),
          totalConfirmed: newSumConfirmed
        });
        
      },
    });
  }
  FormatNum(num) {
    return (
      num
        .toFixed(0) // no decimal
        .replace('.', ',') // replace decimal point character with ,
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    ) // use . as a separator
  }
  getDeathsData(src) {
    Papa.parse(src, {
      download: true,
      header: true,
      complete: results => {  

        const {
          meta: { fields }
        } = results;
        // const { refreshing } = this.state;
        const lastColumn = fields[fields.length - 1];
        let sumDeath = 0
        for(var i = 0; i < results.data.length-1; i++){
          sumDeath = sumDeath + parseInt(results.data[i][lastColumn])
        }
        let newDeath = this.FormatNum(sumDeath)
        // if (refreshing === true) { 
        //   console.log("Updated via pull-to-refresh")
        // }
        const countryKeys = countries.map(country => country.key)
        const exclusiveData = results.data.filter(row => countryKeys.indexOf(row['Country/Region']) >= 0 )
        // console.log(exclusiveData)
        this.setState({
          date: lastColumn,
          deathsData: exclusiveData,
          similarDData: this.transformData(results.data, countries, fields.slice(55, fields.length), 'similar'),
          wdDData: this.transformData(results.data, countries, fields.slice(55, fields.length), 'wd' ),
          optionDData: this.transformData(results.data, countries, fields.slice(48, fields.length), 'option'),
          earlyDData: this.transformData(results.data, countries, fields.slice(45, fields.length), 'early'),
          pydeath: this.maxCases(results.data, lastColumn, "Paraguay"),
          totalDeaths: newDeath
        });
        
      },
    });
  }

  getDataset() {
    if (this.state.srcSelector === 'deaths') {
      return this.state.similarDData
    } else {
      return this.state.similarIData
    }
  }

  componentDidMount() {
    this.getInfectedData(hopkins_confirmed);
    // this.getTestData(owid_test_m) 
    this.getDeathsData(hopkins_deaths)
  }

  onRefresh() {
    // Note: ideally, do some async/setState callback magic instead
    this.setState({
      refreshing: true
    });
    this.reloadData();
  }

  render() {
    const { confirmedData, 
      date, 
      similarIData,
      wdIData,
      earlyIData,
      optionIData, 
      similarDData,
      wdDData,
      earlyDData,
      optionDData,  
      srcSelector
      } = this.state;
      const nameTabA = `Gráfico fallecidos`
      const nameTabB = `Gráfico confirmados`
  
      const currentStringDate = `Actualizado al ${(new Date(date)).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`  

    return (
      <Container fluid>
        <h1>En el mundo 🌍 Fallecidos: {this.state.totalDeaths} - Infectados: {this.state.totalConfirmed} </h1>
        <h1>En Paraguay 🇵🇾 Fallecidos: {this.state.pydeath} - Infectados: {this.state.pyacccases} </h1>
        <small>{currentStringDate}</small>
        <Menu inverted secondary>
          <Menu.Item
            id='deaths'
            name={nameTabA}
            active={srcSelector === 'deaths'}
            onClick={this.changeDataSrc}
          />
          <Menu.Item
            id='confirmed'
            name={nameTabB}
            active={srcSelector === 'confirmed'}
            onClick={this.changeDataSrc}
          />
        </Menu>
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={8}>
                <h3>Países similares en LatAm</h3>
                <Chart data={this.getDataset()} countries={countries.filter(c => c.similar )}  />
              </Grid.Column>
              <Grid.Column width={8}>
                <h3>Países que consiguen aplanar la curva</h3>
                <Chart data={this.getDataset()} countries={countries.filter(c => c.wd )} />
                
              </Grid.Column>
            </Grid.Row>
            <Grid.Row >
              <Grid.Column width={8}>
                <h3>Países con acciones diferentes al resto del mundo</h3>
                <Chart data={this.getDataset()} countries={countries.filter(c => c.option )} />
              </Grid.Column>
              <Grid.Column width={8}>
                <h3>Países con acciones en etapas tempranas</h3>
                <Chart data={this.getDataset()} countries={countries.filter(c => c.early )} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
          <Container text>
            <p>Inspirado en la repo de <a href="https://github.com/phonnz/covid-mx" target="_blank">@phonnz</a></p>
            <p><a href="https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd" target="_blank">WHO</a> | <a href="https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6" target="_blank">JHU</a> | <a href="https://covid19.isciii.es/" target="_blank">ISC</a></p>
            <p>Datos de: <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank">Johns Hopkins CSSE</a></p>
          </Container>
      </Container>
      
    );
  }
  
}

export default App;
