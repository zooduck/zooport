export interface SkydiveCentre {
    id: string;
    club: string;
    place: string;
    latitude: number;
    longitude: number;
    site: string;
}

export const skydiveCentres: SkydiveCentre[] = [
    {
        id: 'army_parachute_association',
        club: 'Army Parachute Association',
        place: 'Army Parachute Association, Netheravon, Salisbury, UK',
        latitude: 51.245641,
        longitude: -1.760713,
        site: 'https://netheravon.com',
    },
    {
        id: 'london_parachute_school',
        club: 'London Parachute School (LPS)',
        place: 'Skydiving London, Chiltern Park, UK',
        latitude: 51.552760,
        longitude: -1.100669,
        site: 'https://skydivinglondon.com',
    },
    {
        id: 'north_london_skydiving_centre',
        club: 'North London Skydiving Centre',
        place: 'North London Skydiving Centre, Chatteris, UK',
        latitude: 52.487691,
        longitude: 0.088212,
        site: 'https://ukskydiving.com',
    },
    {
        id: 'skydive_algarve',
        club: 'Skydive Algarve',
        place: 'Skydive Algarve, Aerodromo Municipal de Portimao, Alvor, Portugal',
        latitude: 37.147537,
        longitude: -8.581197,
        site: 'https://skydivealgarve.com',
    },
    {
        id: 'skydive_headcorn',
        club: 'Skydive Headcorn',
        place: 'Skydive Headcorn, Headcorn, Ashford, UK',
        latitude: 51.154044,
        longitude: 0.645511,
        site: 'https://headcorn.com',
    },
    {
        id: 'skydive_hibaldstow',
        club: 'Skydive Hibaldstow',
        place: 'Skydive Hibaldstow, Hibaldstow Airfield, UK',
        latitude: 53.500222,
        longitude: -0.523414,
        site: 'https://skydiving.co.uk',
    },
    {
        id: 'skydive_langar',
        club: 'Skydive Langar',
        place: 'Skydive Langar, Nottinghamshire, UK',
        latitude: 52.889805,
        longitude: -0.906808,
        site: 'https://skydivelangar.co.uk',
    },
    {
        id: 'skydive_spain',
        club: 'Skydive Spain',
        place: 'Skydive Spain, Aerodromo La Juliana, Sevilla, Spain',
        latitude: 37.296178,
        longitude: -6.159196,
        site: 'https://skydivespain.com',
    },
    {
        id: 'uk_parachuting',
        club: 'UK Parachuting',
        place: 'UK Parachuting, Sibson Airfield',
        latitude: 52.555305,
        longitude: -0.390292,
        site: 'https://skydivesibson.co.uk',
    },
];
