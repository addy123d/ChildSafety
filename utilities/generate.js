// Function to generate random latitude and longitude coordinates !
// Range latitude = -90 to 90
// Longitude = -180 to 180

function generate() {
    // General Syntax - Math.floor(Math.random() * (end - start + 1)) + start

    let latitude = Math.floor(Math.random() * (90 - 0 + 1)) + 0;
    let longitude = Math.floor(Math.random() * (180 - 0 + 1)) + 0;
    let string;

    string = {
        latitude: latitude,
        longitude: longitude
    };

    //For debugging purpose ! 
    console.log("Latitude :", latitude);
    console.log("Longitude :", longitude);

    return string;
}


module.exports = generate;