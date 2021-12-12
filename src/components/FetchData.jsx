import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

import './FetchData.css';

const rocketColors = {
    'Falcon 1': '#d86628',
    'Falcon 9': '#4b78bd',
    'Falcon Heavy': '#6baa47'
}

export default function FetchData (props) {

    const [data, setData] = useState([]);
    const svgRef = useRef();

    async function getData () {
        try {
            const apiData = await fetch ('https://api.spacexdata.com/v2/launches', {
                method: 'GET'
            }).then(res => res.json());
            setData(apiData)
        } catch (error) {
            console.log(error)
        }
    }

    // Count up all of the unqiue rocket names
    function getRocketCount () {
        const launches = {};

        data.forEach(launch => {
            if (launches.hasOwnProperty(launch.rocket.rocket_name)) {
                launches[launch.rocket.rocket_name] += 1;
            } else {
                launches[launch.rocket.rocket_name] = 1;
            }
        })

        return launches;
    }

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        if (data.length) {
            console.log(getRocketCount())
        }

        const svg = d3.select(svgRef.current);

        const circleRadius = 5;
        const lineLength = 200 - circleRadius;
        const minYear = d3.min(data, d => d3.timeParse('%Y')(d.launch_year))
        const maxYear = new Date('2022-01-02');

        const y = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([0, 3000])

        // Draw the vertical axis
        svg.append('g')
            .call(d3.axisLeft(y))
            .attr('transform', 'translate(100, 100)')
            .attr('class', 'timeline-axis')
        
        // Draw the circles for each launch entry
        svg.append('g')
            .selectAll('cirlce')
            .data(data)
            .join('circle')
                .attr('transform', 'translate(0, 100)')
                .attr('cx', lineLength + circleRadius)
                .attr('cy', d => y(new Date(d.launch_date_utc)))
                .attr('r', circleRadius)
                .style('fill', d => rocketColors[d.rocket.rocket_name])
        
        // Draw the line from the axis to the circle
        svg.append('g')
            .selectAll('line')
            .data(data)
            .join('line')
                .attr('class', 'line-extension')
                .attr('x1', 100)
                .attr('y1', d=> y(new Date(d.launch_date_utc)) + 100)
                .attr('x2', lineLength)
                .attr('y2', d=> y(new Date(d.launch_date_utc)) + 100)


    }, [data])

    return (
        <div id="timeline-container">
            <svg ref={svgRef}></svg>
        </div>
    )
}