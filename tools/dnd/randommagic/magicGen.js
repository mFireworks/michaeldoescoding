var enchantMap = [
    [getTrinketEnchants, getWeaponEnchants, getArmorEnchants],
    [getTrinketCurses, getWeaponCurses, getArmorCurses]
];

initLists();

function getListIndex() {
    var selected = $("#itemType option:selected").val();
    if (selected < 3 && selected >= 0) {
        return selected;
    }
    return Math.floor(Math.random() * 3);
}

$(document).ready(function() {

    trinketSelected();
    $("#itemType").change(trinketSelected);
    $("#submit").click(generateItems);

    function trinketSelected(evt) {
        var selected = $("#itemType option:selected").val();
        console.log(selected);
        if (selected == 0) {
            $("#trinketOptions").show();
        } else {
            $("#trinketOptions").hide();
        }
    }

    function generateItems(evt) {
        $("#output").empty();
        var numOfItems = $("#numOfItems").val();
        if (numOfItems === "") {
            numOfItems = 0;
        }
        var itemType = getListIndex();
        console.log(itemType);
        var curseChance = $("#curseChance").val();
        if (curseChance === "") {
            curseChance = 0;
        }
        if (curseChance > 100) {
            $("#output").append("Error: Curse Percentage entered was above 100%.");
            return;
        }
        else if (curseChance < 0) {
            $("#output").append("Error: Curse Percentage entered was below 0%.");
            return;
        }

        var cursedTrinkets = $("#trinketOption").prop("checked") && $("#trinketOption").is(":visible");

        for (var cycle = 0; cycle < numOfItems; ++cycle) {
            var cursed = Math.random();
            var isCursed = 0;
            if (cursed < (curseChance/100) || cursedTrinkets) {
                isCursed = 1;
            }

            $("#output").append("Item #" + (cycle + 1) + ":<br>");
            generateItem(itemType, isCursed);
            $("#output").append("<br>");
        }
    }

    function generateItem(selectedIndex, isCursed) {
        var selectedList = enchantMap[isCursed][selectedIndex]();
        var selectedItem = Math.floor(Math.random() * selectedList.length);


        $("#output").append("Item Type: " + selectedList[selectedItem].name + "<br>");
        if (itemType === "Trinket") {
            $("#output").append("Guaranteed Cursed Trinkets: " + cursedTrinkets + "<br>")
        }
        $("#output").append("Curse? " + isCursed + "<br>");
    }
});