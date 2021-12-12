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

        const circleRadius = 10;
        const lineLength = 200 - circleRadius;
        const minYear = d3.min(data, d => d3.timeParse('%Y')(d.launch_year))
        const maxYear = new Date('2022-01-02');

        const y = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([0, 3000])
        
        // Make circle larger when hovered over
        function expandLaunch () {
            this.parentNode.appendChild(this);

            d3.select(this)
                .transition()
                    .duration(250)
                    .attr('r', circleRadius * 3)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 3)
                    
                        
        }

        // Make circle small when mouse stops hovering
        function contractLaunch () {
            this.parentNode.appendChild(this);

            d3.select(this)
                .transition()
                    .duration(250)
                    .attr('r', circleRadius)
                    .attr('stroke-width', 0)
        }

        // Draw the vertical axis
        svg.append('g')
            .call(d3.axisLeft(y))
            .attr('transform', 'translate(100, 100)')
            .attr('class', 'timeline-axis')
        
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
        
        // Draw the circles for each launch entry
        svg.append('g')
            .selectAll('circle')
            .data(data)
            .join('circle')
                .attr('transform', 'translate(0, 100)')
                .attr('cx', lineLength + circleRadius)
                .attr('cy', d => y(new Date(d.launch_date_utc)))
                .attr('r', circleRadius)
                .style('fill', d => rocketColors[d.rocket.rocket_name])
                .on('mouseover', expandLaunch)
                .on('mouseleave', contractLaunch)
                
        // Draw numbers in the circles
        svg.append('g')
            .selectAll('text')
            .data(data)
            .join('text')
                .attr('transform', 'translate(0, 100)')
                .attr('class', 'launch-number')
                .attr('font-size', '18px')
                .attr('x', lineLength + circleRadius)
                .attr('y', d => y(new Date(d.launch_date_utc)))
                .attr('text-anchor', 'center')
                .style('visibility', 'hidden')
                .text(d => d.flight_number)

    }, [data])

    return (
        <div id="timeline-container">
            <svg ref={svgRef}></svg>
        </div>
    )
}