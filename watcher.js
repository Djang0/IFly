const {
    exec
} = require('child_process');
const processor = require('./dbprocessor')
const fs = require('fs');

const {
    config
} = require('process');
const {
    Console
} = require('console');
const sqlite3 = require('sqlite3').verbose();
const app_config = JSON.parse(fs.readFileSync('app_config.json'));;

setupWorkEnv = function (rowid) {
    usr_dir = app_config.work_dir + 'p/' + rowid + '/';
    if (!fs.existsSync(usr_dir)) {
        fs.mkdirSync(usr_dir, {
            recursive: true
        });
    }
    return usr_dir;
}


function processZip(email, new_etag, rowid, zip_url, dbp) {
    console.log("IIIN zip")
    work_dir = setupWorkEnv(rowid)
    dl_comm = 'wget -O ' + work_dir + 'out.zip "' + zip_url + '"'
    exec(dl_comm, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            console.log(stdout);
            if (fs.existsSync(work_dir + 'out.zip')) {
                //unzip 

                unz_comm = "unzip " + work_dir + "out.zip -d " + work_dir
                exec(unz_comm, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(stdout);
                        try {
                            fs.unlinkSync(work_dir + "out.zip")
                            console.log('archive removed');
                        } catch (err) {
                            console.error(err)
                        }
                        if (fs.existsSync(work_dir + 'config.json')) {
                            console.log("found pilot's config.json");
                            pilot_config = JSON.parse(fs.readFileSync(work_dir + 'config.json'));
                            console.log("beforre");
                            processor.processdb(work_dir, pilot_config,dbp,rowid,new_etag,email)
                            
                        } else {
                            console.log("pilot's config.json not found : " + work_dir + 'config.json')
                        }
                    }
                });
                // process logfly db

            } else {
                // error
                console.log("Pilot's archive not found")
            }
        }
    });
}

processPilots = function (data, dbp) {
    var command = "";

    data.forEach((row, ii) => {
        console.log("IIIN")
        command = 'wget --server-response --spider "' + row.zip_url + '" 2>&1 | grep -i etag'
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
            } else {
                remote_etag = stdout.split('\n')[0].replace(' ', '');
                console.log("remote" + remote_etag + "//" + row.etag)
                if (remote_etag) {
                    if (remote_etag != row.etag) {
                        console.log(row.rowid+" "+row.email+" "+row.etag+" "+row.zip_url)
                        processZip(row.email, remote_etag, row.rowid, row.zip_url, dbp)
                    }
                }
            }
        });
    })

}
const dbp = new sqlite3.Database(app_config.pilots_db, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the pilots database.');
});



dbp.serialize(() => {
    dbp.all(`SELECT rowid,email, zip_url,etag FROM pilots;`, (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        processPilots(rows, dbp);
    });
});