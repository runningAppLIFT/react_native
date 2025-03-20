export type Building = {
    bldg_id : number;
    bldg_geom: {
        type: 'MultiPolygon';
        coordinates: [number, number][][][];
    };
};



