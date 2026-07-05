var armorEnchants = [];
var armorCurses = [];
var trinketEnchants = [];
var trinketCurses = [];
var weaponEnchants = [];
var weaponCurses = [];

function addEntry(list, entry) {
    list.push(entry);
}

function removeEntry(list, entry) {
    var entryIndex = list.indexOf(entry);

    if (index > -1) {
        list.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

function addArmorEnchant(name, flavor, effect) {
    addEntry(armorEnchants, {name:name, flavor:flavor, effect:effect});
}

function addArmorCurse(name, flavor, effect) {
    addEntry(armorCurses, {name:name, flavor:flavor, effect:effect});
}

function addTrinketEnchant(name, flavor, effect) {
    addEntry(trinketEnchants, {name:name, flavor:flavor, effect:effect});
}

function addTrinketCurse(name, flavor, effect) {
    addEntry(trinketCurses, {name:name, flavor:flavor, effect:effect});
}

function addWeaponEnchant(name, flavor, effect) {
    addEntry(weaponEnchants, {name:name, flavor:flavor, effect:effect});
}

function addWeaponCurse(name, flavor, effect) {
    addEntry(weaponCurses, {name:name, flavor:flavor, effect:effect});
}

function removeArmorEnchant(entry) {
    removeEntry(armorEnchants, entry);
}

function removeArmorCurse(entry) {
    removeEntry(armorCurses, entry);
}

function removeTrinketEnchant(entry) {
    removeEntry(trinketEnchants, entry);
}

function removeTrinketCurse(entry) {
    removeEntry(trinketCurses, entry);
}

function removeWeaponEnchant(entry) {
    removeEntry(weaponEnchants, entry);
}

function removeWeaponCurse(entry) {
    removeEntry(weaponCurses, entry);
}

// These init functions will eventually be modified to use the importer, rather than literial code in functions.
function initLists() {
    initArmorEnchants();
    initArmorCurses();
    initTrinketEnchants();
    initTrinketCurses();
    initWeaponEnchants();
    initWeaponCurses();
}

function initArmorEnchants() {
    addArmorEnchant("T E S T", "Is there really armor?", "There could be some effect, but it's unclear if it's really armor");
    addArmorEnchant("Protection V", "A light-blue aura radiates from it, unlike anything you've seen before.", "+2 AC");
}

function initArmorCurses() {
    addArmorCurse("Curse of Binding", "The armor is surprising heavy, holding gives you the urge to put it on.", "Upon putting on the armor, it cannot be taken off willingly. A strength check can be made (DC 17) to forcefully remove it, but will cause 2D8 psychic damage.");
    addArmorCurse("Curse of Vanishing", "Looks to be an ordinary piece of equipment, though it seems to gravitate towards you. Once on, you seem to never want to take it off.", "If the armor is ever taken off, it disintegrates.");
}

function initTrinketEnchants() {
    addTrinketEnchant("NullPointerCheck", "I am not null.", "I am a real entry! :D");
    addTrinketEnchant("Test", "Tester", "Testing");
}

function initTrinketCurses() {
    addTrinketCurse("HelloWorld", "Every Programmer's Beginning", "System.out.println(\"Hello World!\");");
    addTrinketCurse("Boop", "Boop Boop 2", "3 Boops?");
}

function initWeaponEnchants() {
    addWeaponEnchant("INSERTNAME", "The blade is giving off a blue glow of, with ones and zeros scattered around the steel.", "Roll 1D100 on hit - On 100, attacked creatures no longer exists due to game-breaking bug.");
    addWeaponEnchant("Flex Seal", "THATS A LOT OF DAMAGE", "I CUT THIS BOAT IN HALF");
}

function initWeaponCurses() {
    addWeaponCurse("INSERT_ERROR", "The blade is seeming fading in and out of existence, pixelating randomly", "Disadvantage on attack rolls.");
    addWeaponCurse("MissingNo", "?????", "nani");
}

var getArmorEnchants = function getArmorEnchants() {
    return armorEnchants;
}

var getArmorCurses = function getArmorCurses() {
    return armorCurses;
}

var getTrinketEnchants = function getTrinketEnchants() {
    return trinketEnchants;
}

var getTrinketCurses = function getTrinketCurses() {
    return trinketCurses;
}

var getWeaponEnchants = function getWeaponEnchants() {
    return weaponEnchants;
}

var getWeaponCurses = function getWeaponCurses() {
    return weaponCurses;
}