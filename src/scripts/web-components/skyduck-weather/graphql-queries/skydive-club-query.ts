export const skydiveClubQuery = `query SkydiveClub($name: String!) {
    club(name: $name) {
        id,
        name,
        place,
        site,
        latitude,
        longitude,
    }
}`;
