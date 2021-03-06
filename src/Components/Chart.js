import React, { Component, Fragment } from 'react';
import { ResponsiveContainer, ReferenceLine, LineChart, Legend, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Flag } from 'semantic-ui-react'
import Paraguay from './Flags/Paraguay';

class growChart extends Component {
  state = {
    chartData: [
      { name: 'Page 0', mx: 400, },
    ]
  }
//ad some original flags

  getRandomColor = (country) => {
    if(country.key === "Paraguay") return '#de2d1b'
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }



  render() {

    return (
      <ResponsiveContainer height={400}>
        <LineChart width={500} height={400} data={this.props.data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <XAxis dataKey="name" />
          <YAxis  type="number" label={{ value: 'Fallecidos', angle: -90, position: 'insideLeft' }}  />
          {/* <ReferenceLine y={75} label="Max" stroke="red" /> */}
          <ReferenceLine x='3/09/20' stroke="red" label="Fase II PY" />
          <CartesianGrid strokeDasharray="5 5" />
          <Tooltip />
          <Legend label="Confirmados acumulados" />
          {this.props.countries.map(country => {

              if(country.key === "Paraguay"){
                return (<Line key={country.key} type="monotone" dataKey={country.key} stroke={this.getRandomColor(country)} strokeWidth={3} label={country.name} dot={Paraguay}  />)
                
              }  else {
                
                return (<Line key={country.key} type="monotone" dataKey={country.key }  stroke={this.getRandomColor(country)} strokeWidth={2} label={country.name} dot={false} /> )
              }

          })}
        </LineChart>
        </ResponsiveContainer>

    )
  }

}

export default growChart