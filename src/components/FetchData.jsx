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
    const [activeNode, setActiveNode] = useState(null);

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

    // Hide launch details
    function handleHideDetails () {
        setActiveNode(null);
    }

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const circleRadius = 10;
        const lineLength = 200 - circleRadius;
        const minYear = d3.min(data, d => d3.timeParse('%Y')(d.launch_year))
        const maxYear = new Date('2022-01-02');

        const y = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([0, 4000])
        
        // Make circle larger when hovered over
        function handleMouseOver () {
            this.parentNode.appendChild(this);

            d3.select(this)
                .select('circle')
                .transition()
                    .duration(250)
                    .attr('r', circleRadius * 4)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 3)
            
            d3.select(this)
                .select('text')
                    .transition()
                        .duration(250)
                        .style('visibility', 'visible')
                        .style('font-size', '36px')
        }

        // Make circle small when mouse stops hovering
        function handleMouseOut () {
            this.parentNode.appendChild(this);

            d3.select(this)
                .select('circle')
                .transition()
                    .duration(250)
                    .attr('r', circleRadius)
                    .attr('stroke-width', 0)
            
            d3.select(this)
                .select('text')
                    .transition()
                        .duration(250)
                        .style('visibility', 'hidden')
                        .style('font-size', '0px')
        }

        // Show launch details
        function handleShowDetails (e, d) {
            setActiveNode(d);

            updateLines(lines);
            updateCircles(circles);

            d3.select(this)
                .select('line')
                    .attr('x2', lineLength * 3)
            
            d3.select(this)
                .select('circle')
                    .style('visibility', 'hidden')
        }

        // Draw the vertical axis
        svg.append('g')
            .call(d3.axisLeft(y))
            .attr('transform', 'translate(100, 100)')
            .attr('class', 'timeline-axis')
        
        const nodes = svg.selectAll('.node')
            .data(data, d => d.flight_number)
            .enter()
            .append('g')
                .attr('class', 'node')
                .attr('transform', 'translate(0, 100)')
                .on('mouseover', handleMouseOver)
                .on('mouseout', handleMouseOut)
                .on('click', handleShowDetails)

        // Draw the line from the axis to the circle
        const lines = nodes
            .append('line')
        
        updateLines(lines);

        // Draw the circles for each launch entry
        const circles = nodes
            .append('circle')
        
        updateCircles(circles);                
                
        // Draw numbers in the circles
        const texts = nodes
            .append('text')
                .attr('class', 'launch-number')
                .attr('font-size', '18px')
                .attr('x', lineLength + circleRadius)
                .attr('y', d => y(new Date(d.launch_date_utc)))
                .style('font-size', '0px')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'central')
                .style('visibility', 'hidden')
                .text(d => d.flight_number)

        function updateCircles (c) {
            c
                .attr('id', (d, i) => 'circle-' + i)
                .attr('cx', lineLength + circleRadius)
                .attr('cy', d => y(new Date(d.launch_date_utc)))
                .attr('r', circleRadius)
                .style('fill', d => rocketColors[d.rocket.rocket_name])
                .style('visibility', 'visible')
        }

        function updateLines (l) {
            l
                .attr('id', (d, i) => 'extension-' + i)
                .attr('class', 'line-extension')
                .attr('x1', 100)
                .attr('y1', d=> y(new Date(d.launch_date_utc)))
                .attr('x2', lineLength)
                .attr('y2', d=> y(new Date(d.launch_date_utc)))
        }

    }, [data])

    return (
        <div id="timeline-container">
            <svg ref={svgRef}></svg>
            <div onClick={handleHideDetails} id="launch-details" className={ activeNode ? 'active-details' : 'hidden-details'}>{activeNode ? activeNode.details: ''}</div>
        </div>
    )
}