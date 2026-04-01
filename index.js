async function getData() {
    const toDownload = {
        "Asska": {
            "normal": { url: "/data/Asska_res_Normal.txt", name: "Normal" },
            "adv": { url: "/data/Asska_res_Adv.txt", name: "Advantage" },
            "thirdAtk": { url: "/data/Asska_res_ThirdAtk.txt", name: "Third Attack" },
            "thirdAtkAdv": { url: "/data/Asska_res_ThirdAtkAdv.txt", name: "Third Attack Advantage" },
            "thirdAtkAdvExpandedCrit": { url: "/data/Asska_res_ThirdAtkAdvExpandedCrit.txt", name: "Third Attack Advantage + Expanded Crit" },
        },
        "Cowboy": {
            "normal": { url: "/data/Cowboy_res_Normal.txt", name: "Normal" },
            "adv": { url: "/data/Cowboy_res_Adv.txt", name: "Advantage" },
            "thirdAtk": { url: "/data/Cowboy_res_ThirdAtk.txt", name: "Third Attack" },
            "thirdAtkAdv": { url: "/data/Cowboy_res_ThirdAtkAdv.txt", name: "Third Attack + Advantage" },
        },
        "Morai": {
            "normal": { url: "/data/Morai_res_Normal.txt", name: "Normal" },
            "faa": { url: "/data/Morai_res_FirstAtkAdv.txt", name: "First Attack Adv" },
            "aaa": { url: "/data/Morai_res_AllAtkAdv.txt", name: "All Attacks Adv" },
            "aaamt": { url: "/data/Morai_res_AllAtkAdvMultiTarget.txt", name: "All Attacks Adv (Multitarget)" },
            "s": { url: "/data/Morai_res_Smites.txt", name: "Smites" },
            "sfaa": { url: "/data/Morai_res_SmitesFirstAtkAdv.txt", name: "Smites - First Attack Adv" },
            "saaa": { url: "/data/Morai_res_SmitesAllAtkAdv.txt", name: "Smites - All Attacks Adv" },
            "saaamt": { url: "/data/Morai_res_SmitesAllAtkAdvMultiTarget.txt", name: "Smites - All Attacks Adv (Multitarget)" },
        },
        "Ravane": {
            "normal": { url: "/data/Ravane_res_Normal.txt", name: "Normal" },
            "adv": { url: "/data/Ravane_res_Advantage.txt", name: "Advantage" },
            "hid": { url: "/data/Ravane_res_Hidden.txt", name: "Hidden" },
        }
    }



    let promises = new Array();
    for(let char of Object.keys(toDownload)) {
        for(let mode of Object.keys(toDownload[char])) {
            promises.push(fetch(toDownload[char][mode].url)
                            .then(r => r.text())
                            .then(t => {
                                const splitData = t.split("\r\n");
                                return {
                                    char: char,
                                    mode: mode,
                                    name: toDownload[char][mode].name,
                                    data: splitData.slice(1).flatMap(d => {
                                        const splitEntry = d.split("\t");
                                        if (splitEntry.length == 3) {
                                            return [{ damage: Number(splitEntry[0]), percentage: Number(splitEntry[2])}]
                                        }
                                        return [];
                                    })
                                };
                            }))
        }
    }

    let results = await Promise.all(promises);
    return Object.groupBy(results, ({ char }) => char);
}

getData().then(data => {
    const ctx = document.getElementById('chart');

    const maxDamage = Math.max(...Object.values(data).flatMap(d => d.flatMap(x => x.data)).map(x => x.damage));
    const maxPercentage = Math.max(...Object.values(data).flatMap(d => d.flatMap(x => x.data)).map(x => x.percentage));

    let labels = [];

    for(var i = 0; i < maxDamage + 10; i = i + 5){
        labels.push(i);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: Object.values(data)
                .flatMap(x => x)
                .map(x => {
                    return {
                        label: `${x.char} - ${x.name}`,
                        data: x.data.toSorted((a,b) => a.damage - b.damage).map(s => ({x: s.damage, y: s.percentage}))
                    }
                })
        },
        options: {
            responsive: true,
            scales: {
            x: {
                type: 'linear',
                ticks: {
                    callback: function(value, index, values) {
                        return labels[index];
                    },
                }
            },
            y: {
                min: 0,
                beginAtZero: true,
                max: maxPercentage + 0.1,
            }
            },
            plugins: {
            legend: {
                position: 'top',
            },
            }
        }
    });
});