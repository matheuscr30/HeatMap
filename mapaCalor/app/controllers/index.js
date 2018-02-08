var XLSX = require('xlsx')


module.exports.index = function (application, req, res) {
    res.render('index');
}

module.exports.getPoints = function (application, req, res) {
    var workbook = XLSX.readFile('/home/matheus/Documents/ALGAR/MAPS/mapaCalor/app/public/xlsx/trechosatualizados.xlsx');
    var sheet_name_list = workbook.SheetNames;
    console.log(sheet_name_list[0]);

    var worksheet = workbook.Sheets[sheet_name_list[0]];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    var pontosAux = XLSX.utils.sheet_to_json(worksheet);
    var pontos = [];

    for(var i = 0; i < pontosAux.length; i++){
        console.log(pontosAux[i]['Motivo']);
        if(pontosAux[i]['Motivo'] === "Rompimento de Fibra"
            && pontosAux[i]["Protocolo"] != "173260146"
            && pontosAux[i]["Protocolo"] != "
            && pontosAux[i]["Protocolo"] != "173251368")
            pontos.push(pontosAux[i]);
    }

    console.log(pontos);
    res.json({points:pontos});
}