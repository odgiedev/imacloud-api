import multer from 'multer';

type ftna = string | null;

export let file_type_not_allowed:ftna;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/../assets/public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
    },
});

const uploadFile = multer({
    storage,
    limits: {
        fieldNameSize: 300,
        fileSize: 1048576,
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
            file_type_not_allowed = null;
        } else {
            cb(null, false);
            file_type_not_allowed = "Only .png, .jpg and .jpeg format allowed!";
        }
    } 
});

export default uploadFile;
