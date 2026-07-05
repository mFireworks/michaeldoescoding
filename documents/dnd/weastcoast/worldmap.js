// Towns & Cities
var Dawnport = L.latLng([290, 1371]);
var Bartford = L.latLng([496, 1258]);
var ValleysideCity = L.latLng([570, 886]);
var Sagecrest = L.latLng([536, 680]);
var Lakeshore = L.latLng([527, 477]);
var Waveserine = L.latLng([628, 99]);
var NorthhollowVillage = L.latLng([850, 1308]);

// Points of Interest
var PeachApple = L.latLng([312, 1397]);
var GoblinCamp = L.latLng([419, 1279]);
var AbandonedChurch = L.latLng([517, 1177]);
var Blockade = L.latLng([560, 1188]);
var SpiderFarmer = L.latLng([601, 1018]);
var Mansion = L.latLng([569, 752]);
var OwlTower = L.latLng([606, 587]);

// Natural Locations
var InfinteOcean = L.latLng([144, 1555]);
var LakeWyvern = L.latLng([433, 1234]);
var AlderRiver = L.latLng([369, 1305]);
var MetalfuryMountainRange = L.latLng([638, 889]);
var ContinentalValley = L.latLng([554, 981]);
var FoothillGrove = L.latLng([353, 1238]);
var LushOakWoods = L.latLng([435, 1420]);
var HolehillCliffs = L.latLng([565, 251]);
var LakeAsina = L.latLng([509, 520]);

// Icons
function buildIcon(resourceURL) {
    return L.icon({
        iconUrl: resourceURL,
        iconSize: [32,37],
        iconAnchor: [16, 37],
        popupAnchor: [0, -30]
    });
}

var cityIcon = buildIcon('resources/city.png');
var forestIcon = buildIcon('resources/forest.png');
var lakeIcon = buildIcon('resources/lake.png');
var mountainIcon = buildIcon('resources/mountains.png');
var poiIcon = buildIcon('resources/poi.png');
var townIcon = buildIcon('resources/town.png');

function addMarker(coord, icon, name) {
    return L.marker(coord, { icon: icon }).bindPopup(name);
}

var towns = L.layerGroup([
    addMarker(Dawnport, cityIcon, 'Dawnport'),
    addMarker(Bartford, townIcon, "Bartford"),
    addMarker(ValleysideCity, cityIcon, "Valleyside City"),
    addMarker(Sagecrest, townIcon, "Sagecrest"),
    addMarker(Lakeshore, townIcon, "Lakeshore"),
    addMarker(Waveserine, cityIcon, "Waveserine"),
    addMarker(NorthhollowVillage, townIcon, "Northhollow Village")
]);
var pois = L.layerGroup([
    addMarker(PeachApple, poiIcon, 'Peach Apple Brewery'),
    addMarker(GoblinCamp, poiIcon, "Large Goblin Camp"),
    addMarker(AbandonedChurch, poiIcon, "Abandoned Church"),
    addMarker(Blockade, poiIcon, "Valleyside Blockade"),
    addMarker(SpiderFarmer, poiIcon, "Spider Venom Farmer"),
    addMarker(Mansion, poiIcon, "Medusa Mansion"),
    addMarker(OwlTower, poiIcon, "Owl Tower")
]);
var natural = L.layerGroup([
    addMarker(InfinteOcean, lakeIcon, "The Infinite Ocean"),
    addMarker(LakeWyvern, lakeIcon, "Lake Wyvern"),
    addMarker(AlderRiver, lakeIcon, "Alder River"),
    addMarker(MetalfuryMountainRange, mountainIcon, "Metalfury Mountain Range"),
    addMarker(ContinentalValley, mountainIcon, "Continental Valley"),
    addMarker(FoothillGrove, forestIcon, "Foothill Grove"),
    addMarker(LushOakWoods, forestIcon, "Lush Oak Woods"),
    addMarker(HolehillCliffs, mountainIcon, "Holehill Cliffs"),
    addMarker(LakeAsina, lakeIcon, "Lake Asina")
]);

var overlays = {
    "Towns/Cities": towns,
    "Natural Locations": natural,
    "Points of Interest": pois
}

var map = L.map('weastcoast-map', {
    crs: L.CRS.Simple,
    layers: [towns, natural, pois]
});
var bounds = [[0,0], [1080,1920]];
var image = L.imageOverlay('resources/asina.png', bounds).addTo(map);
map.fitBounds(bounds);
var layerControl = L.control.layers({}, overlays).addTo(map);