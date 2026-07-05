$(document).ready(function() {
    var savedQueryResults = null;
    var currentSearchResults = [];
    var pokemonTeam = [];
    var pokemonTeamEvoTrees = [];
    var pokemonTeamMoveMap = {
        stealthRock: "",
        spikes: "",
        toxicSpikes: "",
        stickyWeb: "",
        hazardControl: "",
        pivots: "",
        cleric: "",
        wish: "",
        trickRoom: "",
        priority: ""
    };

    // Type Effect Chart

    var typeChart = null;
    var typeChartQuery = {
        "query": "{" +
            "pokemon_v2_type {" +
              "name\n" +
              "id\n" +
              "pokemon_v2_typeefficacies {" +
                "damage_factor\n" +
                "damage_type_id\n" +
                "pokemonV2TypeByTargetTypeId {" +
                  "id\n" +
                  "name\n" +
                "}" +
              "}" +
            "}" + 
          "}"
    };

    $.post({
        url: "https://beta.pokeapi.co/graphql/v1beta",
        data: JSON.stringify(typeChartQuery),
        contentType: "application/json",
        success: function(result) {
            if (result.errors !== undefined) {
                console.log("Something bad happened. GraphQL couldn't parse JSON.")
            } else {
                typeChart = result.data.pokemon_v2_type;
            }
        },
        error: function() {
            console.log("Type Chart failed.");
        }
    });


    // String Manipulation

    function formatDataString(string) {
        return string.toLowerCase().replace('-',' ').split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function parseFrontSpriteFromPokemon(pokemonEntry) {
        var spriteData = pokemonEntry.pokemon_v2_pokemonsprites[0].sprites.front_default;
        if (spriteData == null)
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
        return spriteData;
    }

    // Sorting/Searching/Filtering Functions

    function pokemonHasMove(pokemonEntry, moveName) {
        return pokemonEntry.pokemon_v2_pokemonmoves.find(moveEntry => moveEntry.pokemon_v2_move.name.includes(moveName));
    }

    function pokemonHasAbility(pokemonEntry, abilityName) {
        return pokemonEntry.pokemon_v2_pokemonabilities.find(ability => ability.pokemon_v2_ability.name.includes(abilityName));
    }

    function pokemonHasType(pokemonEntry, typeName) {
        return pokemonEntry.pokemon_v2_pokemontypes.find(type => type.pokemon_v2_type.name.includes(typeName));
    }

    function parseOutSearchResults(searchFields) {
        for (var evoChainIndex = 0; evoChainIndex < savedQueryResults.pokemon_v2_evolutionchain.length; ++evoChainIndex) {
            var evoChain = savedQueryResults.pokemon_v2_evolutionchain[evoChainIndex];

            for (var speciesIndex = 0; speciesIndex < evoChain.pokemon_v2_pokemonspecies.length; ++speciesIndex) {
                var pokemonSpecies = evoChain.pokemon_v2_pokemonspecies[speciesIndex];

                for (var pokemonIndex = 0; pokemonIndex < pokemonSpecies.pokemon_v2_pokemons.length; ++pokemonIndex) {
                    var pokemon = pokemonSpecies.pokemon_v2_pokemons[pokemonIndex];
                    if (searchFields.pokemon != "" && !pokemon.name.includes(searchFields.pokemon))
                        continue;
                    if (searchFields.ability != "" && !pokemonHasAbility(pokemon, searchFields.ability))
                        continue;
                    if (searchFields.move != "" && !pokemonHasMove(pokemon, searchFields.move))
                        continue;
                    if (searchFields.type != "" && !pokemonHasType(pokemon, searchFields.type))
                        continue;
                    currentSearchResults.push(pokemon);
                }
            }
        }
    }

    function sortPokemonByIDAscending(pokemon1, pokemon2) {
        return pokemon1.id > pokemon2.id;
    }

    function findDataWithIDFromEvoTree(id, evoTrees, dataReturnType) {
        // Return type: 1 == evoTree, 2 == species, 3 == pokemon
        for (var evoChainIndex = 0; evoChainIndex < evoTrees.length; ++evoChainIndex) {
            var evoChain = evoTrees[evoChainIndex];

            for (var speciesIndex = 0; speciesIndex < evoChain.pokemon_v2_pokemonspecies.length; ++speciesIndex) {
                var pokemonSpecies = evoChain.pokemon_v2_pokemonspecies[speciesIndex];

                for (var pokemonIndex = 0; pokemonIndex < pokemonSpecies.pokemon_v2_pokemons.length; ++pokemonIndex) {
                    var pokemon = pokemonSpecies.pokemon_v2_pokemons[pokemonIndex];

                    if (id == pokemon.id) {
                        switch (dataReturnType) {
                            case 1:
                                return evoChain;
                            case 2:
                                return pokemonSpecies;
                            case 3:
                                return pokemon;
                            default:
                                return null;
                        }
                    }
                }
            }
        }
        return null;
    }

    // HTML Manipulation

    function appendTableData(data) {
        return "<td>\n" + data + "\n</td>\n";
    }

    function appendSearchResults() {
        var searchResults = $("#searchResults");
        searchResults.empty();
        for (var index = 0; index < currentSearchResults.length; ++index) {
            pokemonEntry = currentSearchResults[index];
            var tableEntry = "<tr class=\"searchIndex" + index + "\">\n";
            // Sprite
            tableEntry += appendTableData("   <img class=\"card-img-top\" src=\"" + parseFrontSpriteFromPokemon(pokemonEntry) + "\" alt=\"" + pokemonEntry.name + " Sprite\" style=\"width: 64px; height: auto;\">");
            // Name
            tableEntry += appendTableData(formatDataString(pokemonEntry.name));
            // Typing
            var typing = "";
            for (var typeIndex = 0; typeIndex < pokemonEntry.pokemon_v2_pokemontypes.length; ++typeIndex) {
                typing += formatDataString(pokemonEntry.pokemon_v2_pokemontypes[typeIndex].pokemon_v2_type.name) + ", ";
            }
            tableEntry += appendTableData(typing.slice(0, -2));
            //Abilities
            var abilities = "";
            for (var abilityIndex = 0; abilityIndex < pokemonEntry.pokemon_v2_pokemonabilities.length; ++abilityIndex) {
                abilities += formatDataString(pokemonEntry.pokemon_v2_pokemonabilities[abilityIndex].pokemon_v2_ability.name) + ", ";
            }
            tableEntry += appendTableData(abilities.slice(0, -2));
            // HP
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[0].base_stat);
            // Attack
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[1].base_stat);
            // Defense
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[2].base_stat);
            // Special Attack
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[3].base_stat);
            // Special Defense
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[4].base_stat);
            // Speed
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[5].base_stat);
            // BST
            tableEntry += appendTableData(pokemonEntry.pokemon_v2_pokemonstats[0].base_stat + pokemonEntry.pokemon_v2_pokemonstats[1].base_stat + pokemonEntry.pokemon_v2_pokemonstats[2].base_stat +
                pokemonEntry.pokemon_v2_pokemonstats[3].base_stat + pokemonEntry.pokemon_v2_pokemonstats[4].base_stat + pokemonEntry.pokemon_v2_pokemonstats[5].base_stat);
            tableEntry += "</tr>\n";

            searchResults.append(tableEntry);
        }
    }

    function buildTeamCard(pokemonEntry) {
        return "<div class=\"col-lg-2 mt-2\">" +
            "<div class=\"card bg-light h-100 pokemonCard Card" + pokemonTeam.length + "\">" +
                "<div class=\"card-header d-flex justify-content-end\">" +
                    "<button type=\"button\" class=\"btn-close removeCard\" aria-label=\"Remove Pokemon\"></button>" +
                "</div>" +
                "<img class=\"card-img-top\" src=\"" + parseFrontSpriteFromPokemon(pokemonEntry) + "\" alt=\"" + formatDataString(pokemonEntry.name) + " Sprite\">" +
                "<div class=\"card-footer h-100\">" +
                    "<h4>" + formatDataString(pokemonEntry.name) + "</h4>" +
                "</div>" +
            "</div>" +
        "</div>";
    }

    function buildDisplayCard(pokemonEntry) {
        return "<div class=\"card bg-light\">" +
                "<img class=\"card-img-top\" src=\"" + parseFrontSpriteFromPokemon(pokemonEntry) + "\" alt=\"" + formatDataString(pokemonEntry.name) + " Sprite\">" +
                "<div class=\"card-footer\">" +
                    "<h4>" + formatDataString(pokemonEntry.name) + "</h4>" +
                "</div>" +
            "</div>";
    }

    function clearDisplayData() {
        $("#ActivePokemonCardContainer").empty();
        $("#ActivePokemonTypes").empty();
        $("#ActivePokemonAbilities").empty();
        $("#ActivePokemonHP").empty();
        $("#ActivePokemonAtk").empty();
        $("#ActivePokemonDef").empty();
        $("#ActivePokemonSpA").empty();
        $("#ActivePokemonSpD").empty();
        $("#ActivePokemonSpe").empty();
        $("#ActivePokemonBST").empty();
        $("#ActivePokemonUsefulMoves").empty();
    }

    function clearTypeChartRow(typeName) {
        var formattedTypeName = formatDataString(typeName);
        $("#" + formattedTypeName + "ImmuneList").empty();
        $("#" + formattedTypeName + "QuadResistList").empty();
        $("#" + formattedTypeName + "ResistList").empty();
        $("#" + formattedTypeName + "WeakList").empty();
        $("#" + formattedTypeName + "QuadWeakList").empty();
    }

    function fixTypeChartRow(typeName) {
        var formattedTypeName = formatDataString(typeName);

        var immuneList = $("#" + formattedTypeName + "ImmuneList").text();
        if (immuneList !== "")
            $("#" + formattedTypeName + "ImmuneList").text(immuneList.slice(0, -2));

        var quadResistList = $("#" + formattedTypeName + "QuadResistList").text();
        if (quadResistList !== "")
            $("#" + formattedTypeName + "QuadResistList").text(quadResistList.slice(0, -2));
        
        var resistList = $("#" + formattedTypeName + "ResistList").text();
        if (resistList !== "")
            $("#" + formattedTypeName + "ResistList").text(resistList.slice(0, -2));

        var weakList = $("#" + formattedTypeName + "WeakList").text();
        if (weakList !== "")
            $("#" + formattedTypeName + "WeakList").text(weakList.slice(0, -2));

        var quadWeakList = $("#" + formattedTypeName + "QuadWeakList").text();
        if (quadWeakList !== "")
            $("#" + formattedTypeName + "QuadWeakList").text(quadWeakList.slice(0, -2));
    }

    function clearPokemonTeamMoves() {
        pokemonTeamMoveMap.stealthRock = "";
        pokemonTeamMoveMap.spikes = "";
        pokemonTeamMoveMap.toxicSpikes = "";
        pokemonTeamMoveMap.stickyWeb = "";
        pokemonTeamMoveMap.hazardControl = "";
        pokemonTeamMoveMap.pivots = "";
        pokemonTeamMoveMap.cleric = "";
        pokemonTeamMoveMap.wish = "";
        pokemonTeamMoveMap.trickRoom = "";
        pokemonTeamMoveMap.priority = "";
    }

    // Update Team Info

    function addPokemonToMoveLists(pokemonEntry, pokeName) {
        // Stealth Rock
        if (pokemonHasMove(pokemonEntry, "stealth-rock") && !pokemonTeamMoveMap.stealthRock.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.stealthRock += formatDataString(pokeName) + ", ";

        // Spikes
        if (pokemonHasMove(pokemonEntry, "spikes") && !pokemonTeamMoveMap.spikes.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.spikes += formatDataString(pokeName) + ", ";

        // Toxic Spikes
        if (pokemonHasMove(pokemonEntry, "toxic-spikes") && !pokemonTeamMoveMap.toxicSpikes.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.toxicSpikes += formatDataString(pokeName) + ", ";

        // Sticky Web
        if (pokemonHasMove(pokemonEntry, "sticky-web") && !pokemonTeamMoveMap.stickyWeb.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.stickyWeb += formatDataString(pokeName) + ", ";

        // Hazard Control
        if (!pokemonTeamMoveMap.hazardControl.includes(formatDataString(pokeName)) &&
            (pokemonHasMove(pokemonEntry, "defog") ||
            pokemonHasMove(pokemonEntry, "rapid-spin") ||
            pokemonHasMove(pokemonEntry, "court-change") ||
            pokemonHasMove(pokemonEntry, "mortal-spin") ||
            pokemonHasMove(pokemonEntry, "tidy-up")))
                pokemonTeamMoveMap.hazardControl += formatDataString(pokeName) + ", ";

        // Pivots
        if (!pokemonTeamMoveMap.pivots.includes(formatDataString(pokeName)) &&
            (pokemonHasMove(pokemonEntry, "baton-pass") ||
            pokemonHasMove(pokemonEntry, "flip-turn") ||
            pokemonHasMove(pokemonEntry, "parting-shot") ||
            pokemonHasMove(pokemonEntry, "teleport") ||
            pokemonHasMove(pokemonEntry, "u-turn") ||
            pokemonHasMove(pokemonEntry, "volt-switch") ||
            pokemonHasMove(pokemonEntry, "chilly-reception") ||
            pokemonHasMove(pokemonEntry, "shed-tail")))
                pokemonTeamMoveMap.pivots += formatDataString(pokeName) + ", ";

        // Clerics
        if (!pokemonTeamMoveMap.cleric.includes(formatDataString(pokeName)) &&
            (pokemonHasMove(pokemonEntry, "heal-bell") ||
            pokemonHasMove(pokemonEntry, "aromatherapy")))
                pokemonTeamMoveMap.cleric += formatDataString(pokeName) + ", ";

        // Wish
        if (pokemonHasMove(pokemonEntry, "wish") && !pokemonTeamMoveMap.wish.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.wish += formatDataString(pokeName) + ", ";

        // Trick Room
        if (pokemonHasMove(pokemonEntry, "trick-room") && !pokemonTeamMoveMap.trickRoom.includes(formatDataString(pokeName)))
            pokemonTeamMoveMap.trickRoom += formatDataString(pokeName) + ", ";

        // Priority
        if (!pokemonTeamMoveMap.priority.includes(formatDataString(pokeName)) && (
            pokemonEntry.pokemon_v2_pokemonmoves.find(moveEntry => (moveEntry.pokemon_v2_move.priority > 1 && moveEntry.pokemon_v2_move.power !== null)) ||
            pokemonHasMove(pokemonEntry, "sucker-punch")))
            pokemonTeamMoveMap.priority += formatDataString(pokeName) + ", ";
    }

    function updateTeamImportantMoves() {
        clearPokemonTeamMoves();
        for (var teamIndex = 0; teamIndex < pokemonTeam.length; ++teamIndex) {
            var pokemonEntry = pokemonTeam[teamIndex];
            var origName = pokemonEntry.name;
            addPokemonToMoveLists(pokemonEntry, origName);
            var speciesEntry = findDataWithIDFromEvoTree(pokemonEntry.id, pokemonTeamEvoTrees, 2);
            while (speciesEntry.evolves_from_species_id !== null) {
                pokemonEntry = findDataWithIDFromEvoTree(speciesEntry.evolves_from_species_id, pokemonTeamEvoTrees, 3);
                addPokemonToMoveLists(pokemonEntry, origName);
                speciesEntry = findDataWithIDFromEvoTree(pokemonEntry.id, pokemonTeamEvoTrees, 2);
            }
        }

        $("#StealthRockList").text(pokemonTeamMoveMap.stealthRock.slice(0, -2));
        $("#SpikesList").text(pokemonTeamMoveMap.spikes.slice(0, -2));
        $("#ToxicSpikesList").text(pokemonTeamMoveMap.toxicSpikes.slice(0, -2));
        $("#StickyWebList").text(pokemonTeamMoveMap.stickyWeb.slice(0, -2));
        $("#HazardControlList").text(pokemonTeamMoveMap.hazardControl.slice(0, -2));
        $("#PivotMoveList").text(pokemonTeamMoveMap.pivots.slice(0, -2));
        $("#ClericList").text(pokemonTeamMoveMap.cleric.slice(0, -2));
        $("#WishList").text(pokemonTeamMoveMap.wish.slice(0, -2));
        $("#TrickRoomList").text(pokemonTeamMoveMap.trickRoom.slice(0, -2));
        $("#PriorityList").text(pokemonTeamMoveMap.priority.slice(0, -2));
    }

    function updateTeamCores() {
        var corePokemonList = {
            grass: "",
            fire: "",
            water: "",
            dark: "",
            fighting: "",
            psychic: "",
            dragon: "",
            fairy: "",
            steel: "",
            electric: "",
            ground: "",
            poison: "",
            ghost: ""
        };

        for (var teamIndex = 0; teamIndex < pokemonTeam.length; ++teamIndex) {
            var pokemonEntry = pokemonTeam[teamIndex];
            if (!corePokemonList.grass.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "grass"))
                corePokemonList.grass += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.fire.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "fire"))
                corePokemonList.fire += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.water.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "water"))
                corePokemonList.water += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.dark.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "dark"))
                corePokemonList.dark += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.fighting.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "fighting"))
                corePokemonList.fighting += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.psychic.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "psychic"))
                corePokemonList.psychic += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.dragon.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "dragon"))
                corePokemonList.dragon += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.fairy.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "fairy"))
                corePokemonList.fairy += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.steel.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "steel"))
                corePokemonList.steel += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.electric.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "electric"))
                corePokemonList.electric += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.ground.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "ground"))
                corePokemonList.ground += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.poison.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "poison"))
                corePokemonList.poison += formatDataString(pokemonEntry.name) + ", ";

            if (!corePokemonList.ghost.includes(formatDataString(pokemonEntry.name)) && pokemonHasType(pokemonEntry, "ghost"))
                corePokemonList.ghost += formatDataString(pokemonEntry.name) + ", ";
        }

        $("#GrassCoreList").text(corePokemonList.grass.slice(0, -2));
        $("#FireCoreList").text(corePokemonList.fire.slice(0, -2));
        $("#WaterCoreList").text(corePokemonList.water.slice(0, -2));
        $("#DarkCoreList").text(corePokemonList.dark.slice(0, -2));
        $("#FightingCoreList").text(corePokemonList.fighting.slice(0, -2));
        $("#PsychicCoreList").text(corePokemonList.psychic.slice(0, -2));
        $("#DragonCoreList").text(corePokemonList.dragon.slice(0, -2));
        $("#FairyCoreList").text(corePokemonList.fairy.slice(0, -2));
        $("#SteelCoreList").text(corePokemonList.steel.slice(0, -2));
        $("#ElectricCoreList").text(corePokemonList.electric.slice(0, -2));
        $("#GroundCoreList").text(corePokemonList.ground.slice(0, -2));
        $("#PoisonCoreList").text(corePokemonList.poison.slice(0, -2));
        $("#GhostCoreList").text(corePokemonList.ghost.slice(0, -2));
    }

    function updateSpeedTiers() {
        var speedTiers = {
            slowest: "",
            slower: "",
            slow: "",
            fast: "",
            faster: "",
            fastest: ""
        };

        var speedList = [];
        for (var teamIndex = 0; teamIndex < pokemonTeam.length; ++teamIndex) {
            var pokemonEntry = pokemonTeam[teamIndex];
            var baseSpeed = pokemonEntry.pokemon_v2_pokemonstats[5].base_stat;
            if (!speedTiers.slowest.includes(formatDataString(pokemonEntry.name)) && baseSpeed <= 30)
                speedTiers.slowest += formatDataString(pokemonEntry.name) + ", ";

            if (!speedTiers.slower.includes(formatDataString(pokemonEntry.name)) && baseSpeed > 30 && baseSpeed <= 50)
                speedTiers.slower += formatDataString(pokemonEntry.name) + ", ";

            if (!speedTiers.slow.includes(formatDataString(pokemonEntry.name)) && baseSpeed > 50 && baseSpeed <= 70)
                speedTiers.slow += formatDataString(pokemonEntry.name) + ", ";

            if (!speedTiers.fast.includes(formatDataString(pokemonEntry.name)) && baseSpeed > 70 && baseSpeed <= 90)
                speedTiers.fast += formatDataString(pokemonEntry.name) + ", ";

            if (!speedTiers.faster.includes(formatDataString(pokemonEntry.name)) && baseSpeed > 90 && baseSpeed <= 110)
                speedTiers.faster += formatDataString(pokemonEntry.name) + ", ";

            if (!speedTiers.fastest.includes(formatDataString(pokemonEntry.name)) && baseSpeed > 110)
                speedTiers.fastest += formatDataString(pokemonEntry.name) + ", ";

            speedList.push(baseSpeed);
        }

        $("#SlowestSpeedList").text(speedTiers.slowest.slice(0, -2));
        $("#40SpeedList").text(speedTiers.slower.slice(0, -2));
        $("#60SpeedList").text(speedTiers.slow.slice(0, -2));
        $("#80SpeedList").text(speedTiers.fast.slice(0, -2));
        $("#100SpeedList").text(speedTiers.faster.slice(0, -2));
        $("#GreatestSpeedList").text(speedTiers.fastest.slice(0, -2));

        speedList.sort((a, b) => a - b);
        var biggestSpeedGap = 0;
        for (speedIndex = 0; speedIndex < speedList.length - 1; ++speedIndex)
            biggestSpeedGap = Math.max(Math.abs(speedList[speedIndex] - speedList[speedIndex + 1]), biggestSpeedGap);
        $("#LargestSpeedGap").text(biggestSpeedGap);
    }

    function updateTypeChart() {
        for (var typeIndex = 0; typeIndex < 18; ++typeIndex) { // Currently only 18 "official" types
            var attackingType = typeChart[typeIndex];
            clearTypeChartRow(attackingType.name);

            for (var teamIndex = 0; teamIndex < pokemonTeam.length; ++teamIndex) {
                var pokemonEntry = pokemonTeam[teamIndex];

                var typeEffects = [];
                for (var pokemonTypeIndex = 0; pokemonTypeIndex < pokemonEntry.pokemon_v2_pokemontypes.length; ++pokemonTypeIndex) {
                    var pokemonType = pokemonEntry.pokemon_v2_pokemontypes[pokemonTypeIndex];
                    typeEffects.push(attackingType.pokemon_v2_typeefficacies[pokemonType.pokemon_v2_type.id - 1].damage_factor / 100);
                }
                var attackingResult = 1;
                for (var effectIndex = 0; effectIndex < typeEffects.length; ++effectIndex)
                    attackingResult *= typeEffects[effectIndex];

                switch (attackingResult) {
                    case 0:
                        $("#" + formatDataString(attackingType.name) + "ImmuneList").append(formatDataString(pokemonEntry.name) + ", ");
                        break;
                    case .25:
                        $("#" + formatDataString(attackingType.name) + "QuadResistList").append(formatDataString(pokemonEntry.name) + ", ");
                        break;
                    case .5:
                        $("#" + formatDataString(attackingType.name) + "ResistList").append(formatDataString(pokemonEntry.name) + ", ");
                        break;
                    case 2:
                        $("#" + formatDataString(attackingType.name) + "WeakList").append(formatDataString(pokemonEntry.name) + ", ");
                        break;
                    case 4:
                        $("#" + formatDataString(attackingType.name) + "QuadWeakList").append(formatDataString(pokemonEntry.name) + ", ");
                        break;
                }
            }
            fixTypeChartRow(attackingType.name);
        }
    }

    // Events
    function updateTeamInfo() {
        updateTeamImportantMoves();
        updateTeamCores();
        updateSpeedTiers();
        updateTypeChart();
    }

    function switchActivePokemon(evt) {
        if ($(this).hasClass("active"))
            return;
        if ($(evt.target).is(".removeCard"))
            return;
        $(".active.pokemonCard").addClass("bg-light");
        $(".active.pokemonCard").removeClass("active bg-primary");
        $(this).addClass("active bg-primary");
        $(this).removeClass("bg-light");

        clearDisplayData();
        for (var matchIndex = 0; matchIndex < pokemonTeam.length; ++matchIndex) {
            if ($(this).hasClass("Card" + matchIndex)) {
                pokemonEntry = pokemonTeam[matchIndex];
                
                // Preview Card
                $("#ActivePokemonCardContainer").append(buildDisplayCard(pokemonEntry));

                //Typing
                var typing = "";
                for (var typeIndex = 0; typeIndex < pokemonEntry.pokemon_v2_pokemontypes.length; ++typeIndex) {
                    typing += formatDataString(pokemonEntry.pokemon_v2_pokemontypes[typeIndex].pokemon_v2_type.name) + ", ";
                }
                $("#ActivePokemonTypes").append(typing.slice(0, -2));

                //Abilities
                var abilities = "";
                for (var abilityIndex = 0; abilityIndex < pokemonEntry.pokemon_v2_pokemonabilities.length; ++abilityIndex) {
                    abilities += formatDataString(pokemonEntry.pokemon_v2_pokemonabilities[abilityIndex].pokemon_v2_ability.name) + ", ";
                }
                $("#ActivePokemonAbilities").append(abilities.slice(0, -2));

                // Stats
                $("#ActivePokemonHP").append(pokemonEntry.pokemon_v2_pokemonstats[0].base_stat);
                $("#ActivePokemonAtk").append(pokemonEntry.pokemon_v2_pokemonstats[1].base_stat);
                $("#ActivePokemonDef").append(pokemonEntry.pokemon_v2_pokemonstats[2].base_stat);
                $("#ActivePokemonSpA").append(pokemonEntry.pokemon_v2_pokemonstats[3].base_stat);
                $("#ActivePokemonSpD").append(pokemonEntry.pokemon_v2_pokemonstats[4].base_stat);
                $("#ActivePokemonSpe").append(pokemonEntry.pokemon_v2_pokemonstats[5].base_stat);
                $("#ActivePokemonBST").append(pokemonEntry.pokemon_v2_pokemonstats[0].base_stat + pokemonEntry.pokemon_v2_pokemonstats[1].base_stat + pokemonEntry.pokemon_v2_pokemonstats[2].base_stat +
                    pokemonEntry.pokemon_v2_pokemonstats[3].base_stat + pokemonEntry.pokemon_v2_pokemonstats[4].base_stat + pokemonEntry.pokemon_v2_pokemonstats[5].base_stat);

                // Useful Moves
                var moves = "";
                if (pokemonTeamMoveMap.stealthRock.includes(formatDataString(pokemonEntry.name)))
                    moves += "Stealth Rock, ";
                if (pokemonTeamMoveMap.spikes.includes(formatDataString(pokemonEntry.name)))
                    moves += "Spikes, ";
                if (pokemonTeamMoveMap.toxicSpikes.includes(formatDataString(pokemonEntry.name)))
                    moves += "Toxic Spikes, ";
                if (pokemonTeamMoveMap.stickyWeb.includes(formatDataString(pokemonEntry.name)))
                    moves += "Sticky Web, ";
                if (pokemonTeamMoveMap.hazardControl.includes(formatDataString(pokemonEntry.name)))
                    moves += "Hazard Control, ";
                if (pokemonTeamMoveMap.pivots.includes(formatDataString(pokemonEntry.name)))
                    moves += "Pivot Move, ";
                if (pokemonTeamMoveMap.cleric.includes(formatDataString(pokemonEntry.name)))
                    moves += "Heal Bell/Aromatherapy, ";
                if (pokemonTeamMoveMap.wish.includes(formatDataString(pokemonEntry.name)))
                    moves += "Wish, ";
                if (pokemonTeamMoveMap.trickRoom.includes(formatDataString(pokemonEntry.name)))
                    moves += "Trick Room, ";
                if (pokemonTeamMoveMap.priority.includes(formatDataString(pokemonEntry.name)))
                    moves += "Priority, ";
                $("#ActivePokemonUsefulMoves").append(moves.slice(0, -2));

                break;
            }
        }
    }

    function clearSearchFields() {
        $("#searchResults").empty();
        $("#pokemonNameSearchField").val('');
        $("#typeSearchField").val('');
        $("#abilitySearchField").val('');
        $("#moveSearchField").val('');
    }

    function search() {
        $("#searchResults").empty();
        currentSearchResults.length = 0;

        searchFields = {
            pokemon: "",
            type: "",
            ability: "",
            move: ""
        };

        searchFields.pokemon = $("#pokemonNameSearchField").val().trim().replace(' ','-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
        searchFields.type = $("#typeSearchField").val().trim().replace(' ','-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
        searchFields.ability = $("#abilitySearchField").val().trim().replace(' ','-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
        searchFields.move = $("#moveSearchField").val().trim().replace(' ','-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
        if (searchFields.pokemon == "" && searchFields.type == "" && searchFields.ability == "" && searchFields.move == "")
            return;

        var testData = {
            "query": "{ pokemon_v2_evolutionchain("+
            "where: {" +
                "pokemon_v2_pokemonspecies: {" +
                    "pokemon_v2_pokemons: {" +
                        "name: {_like: \"%" + searchFields.pokemon +"%\"}," +
                        "pokemon_v2_pokemonabilities: {" +
                            "pokemon_v2_ability: {" +
                                "name: {_like: \"%" + searchFields.ability + "%\"}" +
                            "}" +
                        "}," +
                        "pokemon_v2_pokemonmoves: {" +
                            "pokemon_v2_move: {" +
                                "name: {_like: \"%" + searchFields.move + "%\"}" +
                            "}" +
                        "}," +
                        "pokemon_v2_pokemontypes: {"+
                            "pokemon_v2_type: {"+
                                "name: {_like: \"%" + searchFields.type + "%\"}" +
                            "}" +
                        "}" +
                    "}" +
                "}" +
            "}" +
        ") {" +
            "pokemon_v2_pokemonspecies {" +
              "evolves_from_species_id\n" +
              "pokemon_v2_pokemons {" +
                "name\n" +
                "pokemon_v2_pokemonabilities {" +
                  "pokemon_v2_ability {" +
                    "name" +
                  "}" +
                  "is_hidden" +
                "}" +
                "pokemon_v2_pokemonmoves {" +
                  "pokemon_v2_move {" +
                    "name\n" +
                    "power\n" +
                    "priority\n" +
                  "}" +
                "}" +
                "pokemon_v2_pokemonsprites {" +
                  "sprites" +
                "}" +
                "pokemon_v2_pokemonstats {" +
                  "base_stat" +
                "}" +
                "pokemon_v2_pokemontypes {" +
                  "pokemon_v2_type {" +
                    "name\n" +
                    "id\n" +
                  "}" +
                "}" +
                "id" +
              "}" +
            "}" +
          "}" +
        "}"
        };

        $.post({
            url: "https://beta.pokeapi.co/graphql/v1beta",
            data: JSON.stringify(testData),
            contentType: "application/json",
            success: function(result) {
                if (result.errors !== undefined) {
                    console.log("Something bad happened. GraphQL couldn't parse JSON.")
                } else {
                    savedQueryResults = result.data;
                    parseOutSearchResults(searchFields);
                    currentSearchResults.sort(sortPokemonByIDAscending);
                    appendSearchResults();
                }
            },
            error: function() {
                console.log("Search failed.");
            }
        });
    }

    function addPokemonToTeam() {
        for (var matchIndex = 0; matchIndex < currentSearchResults.length; ++matchIndex) {
            if ($(this).hasClass("searchIndex" + matchIndex)) {
                $("#pokemonTeam").append(buildTeamCard(currentSearchResults[matchIndex]));
                pokemonTeam.push(currentSearchResults[matchIndex]);
                pokemonTeamEvoTrees.push(findDataWithIDFromEvoTree(currentSearchResults[matchIndex].id, savedQueryResults.pokemon_v2_evolutionchain, 1));
                updateTeamInfo();
                break;
            }
        }
    }

    function removePokemonFromTeam() {
        for (var matchIndex = 0; matchIndex < pokemonTeam.length; ++matchIndex) {
            if ($(this).parent().parent().hasClass("Card" + matchIndex)) {
                for (var reduceIndex = matchIndex + 1; reduceIndex < pokemonTeam.length; ++reduceIndex) {
                    $(".Card" + reduceIndex).addClass("Card" + (reduceIndex - 1)).removeClass("Card" + reduceIndex);
                }

                if ($(this).parent().parent().hasClass("active"))
                    clearDisplayData();
                $(this).parent().parent().parent().remove();
                pokemonTeam.splice(matchIndex, 1);
                pokemonTeamEvoTrees.splice(matchIndex, 1);
                updateTeamInfo();
                break;
            }
        }
    }

    $("#pokemonTeam").on("click", ".pokemonCard", switchActivePokemon);
    $("#pokemonTeam").on("click", ".removeCard", removePokemonFromTeam);
    $("#basicSearchButton").click(search);
    $("#clearSearchButton").click(clearSearchFields);
    $("#searchTable").on("click", "tbody tr", addPokemonToTeam);

    $('.searchField').keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            $("#basicSearchButton").click();
            return false;
        }
    });
});
