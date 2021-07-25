import dbHandler from "../index";

dbHandler.init().then(r => {
    dbHandler.updateTable();
});
