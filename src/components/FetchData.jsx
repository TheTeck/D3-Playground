import React, { useEffect } from 'react';
import * as d3 from 'd3';

export default function FetchData (props) {

    async function getData () {
        try {
            const data = await fetch ('https://api.spacexdata.com/v2/launches', {
                method: 'GET'
            }).then(res => res.json());
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getData();
    })

    return (
        <div>SpaceX Launches</div>
    )
}