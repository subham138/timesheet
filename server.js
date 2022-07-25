const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const format = require('date-format');
const multer = require('multer');
const port = process.env.PORT || 3000;
require("./db/conn");

////////////// Schemas /////////////////////////
const Register = require('./models/register');
const MdEmp = require('./models/md_emp');
const ProMaster = require('./models/project_master');
const WorkSheet = require('./models/worksheet');
const ProType = require('./models/md_proj_typ');
const ClintType = require('./models/md_clint_typ');
const ProjFrm = require('./models/md_proj_frm');
const BillTyp = require('./models/md_bill_typ');
const Currency = require('./models/md_currency');
////////////////////////////////////////////////

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "templates/views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// console.log(path.join(__dirname, "public"))

// DEFINE MULTER FUNCTION DISK-STORAGE
var Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
})
// DEFINE MIDDLEWARE FOR CHECKING MULTER FUNCTION FOR FILE UPLOADING
var upload = multer({
    storage: Storage
}).single('image');

// SET SESSION
app.use(session({
    secret: 'SSS Worksheet',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 9000000
    }
}));
// Use Session in all view pages
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.get('/', (req, res) => {
    let user = req.session.user;
    if (user) res.render("index");
    else res.redirect('/login');
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/register', (req, res) => {
    res.render("register");
})

app.get('/forgot_password', (req, res) => {
    res.render("forget_password");
})

app.post('/register', async (req, res) => {
    try {
        const reg = new Register({
            emp_code: req.body.emp_id,
            name: req.body.name,
            email: req.body.email,
            number: req.body.phone,
            password: bcrypt.hashSync(req.body.pass, 10)
        })
        const save = await reg.save();
        let user = req.session.user;
        if (user) res.status(200).redirect('/user');
        else res.status(200).redirect('/login');
    } catch {
        res.status(400).render("400");
    }
})

app.post('/login', async (req, res) => {
    try {
        let emp_code = req.body.emp_id;
        let password = req.body.password;
        const user_data = await Register.findOne({ emp_code: emp_code });
        if (bcrypt.compareSync(password, user_data.password)) {
            req.session.user = user_data;
            res.status(201).redirect('/')
            // res.send(bcrypt.compare(password, user_data.password));
            // console.log(bcrypt.compareSync(password, user_data.password));
        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Login Err',
                message: 'Please Check Your Username or Password!'
            }
            res.redirect('/login')
            // res.status(400).send("Please Check Your Email or Password");
        }
        // res.send(user_data);
    } catch {
        res.status(400).render("400");
    }
})

app.get('/log_out', (req, res) => {
    if (req.session.user) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
})

// app.get('/sheet_entry', (req, res) => {
//     res.render('sheet/entry');
// })

//////////////////// USER PROFILE ///////////////////////////////
app.get('/profile', async (req, res) => {
    let user = req.session.user;
    if (user) {
        const user_data = await Register.findOne({ emp_code: user.emp_code });
        // console.log(req.session.user);
        res.render('user/profile', { user_data });
    } else { res.redirect('/login'); }
})
// EDIT
app.get('/update_user', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const user_data = await Register.findOne({ emp_code: req.query.id });
            res.status(200).render('user/edit_profile', { user_data });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// UPDATE
app.post('/profile_update', async (req, res) => {
    try {
        var file_name = '';
        // console.log(req.file);
        upload(req, res, async (err) => {
            if (!req.file) {
                await Register.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name, email: req.body.email, number: req.body.phone });
                await MdEmp.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name });
                const user_data = await Register.findOne({ emp_code: req.body.emp_id });
                req.session.user = user_data;
                req.session.reload((err) => { if (err) { console.error(err); } });
                res.status(200).redirect('/profile');
                // console.log("No File Selected");
            } else {
                file_name = req.file.filename;
                await Register.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name, email: req.body.email, number: req.body.phone, image: file_name });
                await MdEmp.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name });
                const user_data = await Register.findOne({ emp_code: req.body.emp_id });
                req.session.user = user_data;
                req.session.reload((err) => { if (err) { console.error(err); } });
                res.status(200).redirect('/profile');
            }
            if (err) {
                console.log({ 'msg': err });
                return false;
            }
        })
        // var file_name = req.file ? req.file.filename : '';
        // await Register.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name, email: req.body.email, number: req.body.phone, image: file_name });
        // await MdEmp.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name });
        // const user_data = await Register.findOne({ emp_code: req.body.emp_id });
        // req.session.user = user_data;
        // req.session.reload((err) => { if (err) { console.error(err); } });
        // res.status(200).redirect('/profile');
    } catch (err) {
        console.log(err);
        res.status(400).render("400");
    }
})
app.get('/change_password', async (req, res) => {
    var user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('user/reset_password', { emp_code: user.emp_code });
    } else { res.redirect('/login'); }
})
app.post('/update_password', async (req, res) => {
    try {
        var user = req.session.user;
        if (user) {
            await Register.updateOne({ emp_code: req.body.emp_code }, { password: bcrypt.hashSync(req.body.password, 10) });
            res.redirect('/profile');
        } else { res.redirect('/login'); }
    } catch (err) {
        console.log(err);
        res.status(400).render("400");
    }
})

///////////////// EMPLOYE MASTER ///////////////////////////////
// VIEW
app.get('/emp_view', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const user_data = await MdEmp.find();
            res.render('emp_master/view', ({ user_data }));
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// ENTRY
app.get('/emp_entry', (req, res) => {
    let user = req.session.user;
    if (user) {
        res.render('emp_master/entry');
    } else { res.redirect('/login'); }
})
// SAVE
app.post('/emp_entry', async (req, res) => {
    try {
        const epp_reg = new MdEmp({
            emp_code: req.body.emp_id,
            name: req.body.name
        })
        const save = await epp_reg.save();
        res.status(200).redirect('/emp_view');
    } catch {
        res.status(400).render("400");
    }
})
// EDIT
app.get('/emp_edit', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const user_data = await MdEmp.findOne({ emp_code: req.query.id });
            res.render('emp_master/edit', ({ user_data }));
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// UPDATE
app.post('/emp_update', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            await MdEmp.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name });
            res.status(200).redirect('/emp_view');
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// DELETE
app.get('/emp_delete', async (req, res) => {
    try {
        await MdEmp.deleteOne({ emp_code: req.query.id })
        res.status(200).redirect('/emp_view');
    } catch {
        res.status(400).render("400");
    }
})

///////////////// PROJECT MASTER ///////////////////////////////
// VIEW
app.get('/project_view', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const projects = await ProMaster.find().populate('project_type_id').populate('clint_type_id').populate('proj_frm_id').populate('bill_typ_id').populate('currency_id');
            // console.log(projects);
            res.render('project/view', ({ projects }));
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// ENTRY
app.get('/project_entry', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const project_type = await ProType.find();
            const clint_type = await ClintType.find();
            const proj_frm = await ProjFrm.find();
            const bill_type = await BillTyp.find();
            const currency = await Currency.find();
            // console.log(clint_type);
            res.render('project/entry', { project_type, clint_type, proj_frm, bill_type, currency });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// SAVE
app.post('/project_entry', async (req, res) => {
    console.log(req.body);
    try {
        const pro_ms = new ProMaster({
            project_code: req.body.project_id,
            name: req.body.project_name,
            project_type_id: req.body.project_type,
            clint_type_id: req.body.clint_type,
            po_of_cont_1: req.body.po_of_cont_1,
            po_of_cont_2: req.body.po_of_cont_2,
            clint_addr: req.body.clint_addr,
            contact_no: req.body.contact_no,
            email: req.body.email,
            proj_frm_id: req.body.proj_typ,
            buss_exec: req.body.buss_exe,
            bill_typ_id: req.body.bill_typ,
            currency_id: req.body.currency,
            pro_cost: req.body.pro_val
        })
        const save = await pro_ms.save();
        res.status(200).redirect('/project_view');
    } catch {
        res.status(400).render("400");
    }

})
// EDIT
app.get('/edit_project', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const user_data = await ProMaster.findOne({ project_code: req.query.id }).populate('project_type_id').populate('clint_type_id').populate('proj_frm_id').populate('bill_typ_id').populate('currency_id');
            const project_type = await ProType.find();
            const clint_type = await ClintType.find();
            const proj_frm = await ProjFrm.find();
            const bill_type = await BillTyp.find();
            const currency = await Currency.find();
            // console.log(user_data);
            res.render('project/edit', ({ user_data, project_type, clint_type, proj_frm, bill_type, currency }));
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// UPDATE
app.post('/update_project', async (req, res) => {
    try {
        await ProMaster.updateOne({ project_code: req.body.project_id }, {
            name: req.body.project_name,
            project_type_id: req.body.project_type,
            clint_type_id: req.body.clint_type,
            po_of_cont_1: req.body.po_of_cont_1,
            po_of_cont_2: req.body.po_of_cont_2,
            clint_addr: req.body.clint_addr,
            contact_no: req.body.contact_no,
            email: req.body.email,
            proj_frm_id: req.body.proj_typ,
            buss_exec: req.body.buss_exe,
            bill_typ_id: req.body.bill_typ,
            currency_id: req.body.currency,
            pro_cost: req.body.pro_val
        });
        res.status(200).redirect('/project_view')
    } catch {
        res.status(400).render("400");
    }
})
// DELETE
app.get('/delete_project', async (req, res) => {
    try {
        await ProMaster.deleteOne({ project_code: req.query.id })
        res.status(200).redirect('/project_view')
    } catch {
        res.status(400).render("400");
    }
})
// DETAILS
app.get('/details', (req, res) => {
    res.render('project/details');
})

/////////////////// USER DETAILS ///////////////////////////////
// VIEW
app.get('/user', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const user_details = await Register.find();
            res.status(200).render('user/view', { user_details });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// EDIT
app.get('/user_edit', async (req, res) => {
    try {
        const user_data = await Register.findOne({ emp_code: req.query.id });
        res.status(200).render('user/edit', { user_data });
    } catch {
        res.status(400).render("400");
    }
})
// UPDATE
app.post('/user_update', async (req, res) => {
    try {
        await Register.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name, email: req.body.email, number: req.body.phone });
        await MdEmp.updateOne({ emp_code: req.body.emp_id }, { name: req.body.name });
        res.status(200).redirect('/user');
    } catch {
        res.status(400).render("400");
    }
})
// DELETE
app.get('/user_delete', async (req, res) => {
    try {
        await Register.deleteOne({ emp_code: req.query.id });
        res.status(400).redirect('/user');
    } catch {
        res.status(400).render("400");
    }
})

/////////////////////// WORKSHEET ////////////////////////////////
// VIEW
app.get('/sheet', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const curr_date = new Date();
            const curr_year = curr_date.getFullYear();
            const curr_month = (curr_date.getMonth() + 1);
            // const get_month = await WorkSheet.aggregate().
            //     match({ emp_code: user.emp_code, "date.month": curr_month }
            //     );
            const sheet_details = await WorkSheet.find({
                "$expr": {
                    "$and": [
                        { "$eq": [{ "$month": "$date" }, curr_month] },
                        { "$eq": [{ "$year": "$date" }, curr_year] }
                    ]
                }, emp_code: user.emp_code
            }).populate('emp_id').populate('project_id').sort({ date: -1 });
            // console.log(sheet_details);
            let display = "";
            res.status(200).render('sheet/view', { sheet_details, display });
        } else { res.redirect('/login'); }
    } catch (err) {
        console.log(err);
        res.status(400).render("400");
    }
    // const sheet_details = await WorkSheet.find()
    //     .populate({ path: 'emp_id', select: ['name'] });
    // // .populate('emp_id');
    // console.log(sheet_details);
})
// ENTRY
app.get('/sheet_entry', async (req, res) => {
    try {
        const project_list = await ProMaster.find({ isactive: 1 });
        var type = [{ 'id': '1', 'name': 'Developement' }, { 'id': '2', 'name': 'Support' }, { 'id': '3', 'name': 'Documentation' }, { 'id': '4', 'name': 'Sales Call' }, { 'id': '5', 'name': 'Consultation' }, { 'id': '6', 'name': 'Meeting' }];
        res.status(200).render('sheet/entry', { project_list, type });
    } catch {
        res.status(400).render("400");
    }

})
// SAVE
app.post('/sheet_entry', async (req, res) => {
    try {
        const work = new WorkSheet({
            emp_code: req.session.user.emp_code,
            date: req.body.date,
            project_code: req.body.project_id,
            work_type: req.body.type,
            work_done: req.body.work_done,
            hours: req.body.hours
        })
        const save = await work.save();
        req.session.message = {
            type: 'success',
            intro: 'Saved Data',
            message: 'Data Saved Successfully!'
        }
        res.status(200).redirect('/sheet');
    } catch {
        res.status(400).render("400");
    }
})
// EDIT
app.get('/sheet_edit', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const edit_sheet = await WorkSheet.findOne({ _id: req.query.id, emp_code: req.query.emp_code })
            const project_list = await ProMaster.find({ isactive: 1 });
            var type = [{ 'id': '1', 'name': 'Developement' }, { 'id': '2', 'name': 'Support' }, { 'id': '3', 'name': 'Documentation' }, { 'id': '4', 'name': 'Sales Call' }, { 'id': '5', 'name': 'Consultation' }, { 'id': '6', 'name': 'Meeting' }];
            res.status(200).render('sheet/edit', { edit_sheet, project_list, type })
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
// UPDATE
app.post('/sheet_edit', async (req, res) => {
    try {
        await WorkSheet.updateOne({ _id: req.body.id }, { date: req.body.date, project_code: req.body.project_id, work_type: req.body.type, work_done: req.body.work_done, hours: req.body.hours });
        req.session.message = {
            type: 'success',
            intro: 'Update Data',
            message: 'Data Updated Successfully!'
        }
        res.status(200).redirect('/sheet');
    } catch {
        res.status(400).render("400");
    }
})
// DELETE
app.get('/sheet_delete', async (req, res) => {
    try {
        await WorkSheet.deleteOne({ _id: req.query.id, emp_code: req.query.emp_code })
        req.session.message = {
            type: 'danger',
            intro: 'Delete Data',
            message: 'Data Deleted!'
        }
        res.status(200).redirect('/sheet')
    } catch {
        res.status(400).render("400");
    }
})
// VIEW OLD ENTRIES
app.get('/prev_sheet', (req, res) => {
    let user = req.session.user;
    if (user) {
        res.render('sheet/prev_sheet_in');
    } else { res.redirect('/login'); }
})
app.post('/prev_sheet', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            let frm_date = new Date(req.body.frm_date);
            let to_date = new Date(req.body.to_date);
            const sheet_details = await WorkSheet.find({ date: { $gte: frm_date, $lte: to_date }, emp_code: user.emp_code })
                .populate('emp_id').populate('project_id').sort({ date: -1 });
            let display = "none;";
            // console.log(get_data);
            res.status(200).render('sheet/prev_sheet_out', { sheet_details, display });
        } else { req.redirect('/login') }
    } catch {
        res.status(400).render("400");
    }
})
app.get('/sheet_view', async (req, res) => {
    try {
        let user = req.session.user;
        if (user) {
            const edit_sheet = await WorkSheet.findOne({ _id: req.query.id, emp_code: req.query.emp_code })
            const project_list = await ProMaster.find();
            var type = [{ 'id': '1', 'name': 'Developement' }, { 'id': '2', 'name': 'Support' }];
            res.status(200).render('sheet/sheet_view', { edit_sheet, project_list, type })
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})

/////////////////////// REPORT ///////////////////////////////////
app.get('/report', async (req, res) => {
    try {
        let user = req.session.user;
        // console.log(user);
        if (user && user.user_type == 'A') {
            const project_list = await ProMaster.find().sort({ name: 1 });
            // EMP LIST WHERE NOT USER
            // const emp_list = await MdEmp.find({ emp_code: { $ne: user.emp_code } });
            const emp_list = await MdEmp.find().sort({ emp_code: 1 });
            let report_type = '1';
            let header = 'Report By Employe';
            let link = '/report_emp_view';
            res.render('report/report_in', { project_list, emp_list, report_type, header, link });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
app.post('/report_emp_view', async (req, res) => {
    try {
        let user = req.session.user;
        if (user && user.user_type == 'A') {
            const frm_dt = new Date(req.body.frm_date);
            const to_dt = new Date(req.body.to_date);
            const emp_code = req.body.emp_id;
            const project_code = req.body.project_id;
            // console.log(project_code + ' --- ' + frm_dt + ' --- ' + to_dt + ' --- ' + emp_code + ' --- ')
            const where_con = (project_code > 0 && emp_code > 0) ?
                { date: { $gte: frm_dt, $lte: to_dt }, emp_code: emp_code, project_code: project_code } :
                ((project_code > 0 && emp_code == 0) ?
                    { date: { $gte: frm_dt, $lte: to_dt }, project_code: project_code } :
                    ((emp_code > 0 && project_code == 0) ?
                        { date: { $gte: frm_dt, $lte: to_dt }, emp_code: emp_code } : ''));
            const sheet_details = await WorkSheet.find(where_con)
                .populate('emp_id').populate('project_id').sort({ date: 1 });
            const emp = emp_code > 0 ? await MdEmp.findOne({ emp_code: emp_code }) : '';
            const emp_name = emp_code > 0 ? emp.name : '';
            const emp_id = emp_code > 0 ? emp.emp_code : '';
            const projects = project_code > 0 ? await ProMaster.findOne({ project_code: project_code }) : '';
            // console.log(sheet_details);
            const project_name = project_code > 0 ? projects.name : '';
            // console.log(project_name);
            res.status(200).render('report/report_out', { sheet_details, name: emp_name, emp_id: emp_id, form: req.body.frm_date, to: req.body.to_date, project_name });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
app.get('/report_emp_pro', async (req, res) => {
    try {
        let user = req.session.user;
        // console.log(user);
        if (user && user.user_type == 'A') {
            const project_list = await ProMaster.find().sort({ name: 1 });
            // EMP LIST WHERE NOT USER
            // const emp_list = await MdEmp.find({ emp_code: { $ne: user.emp_code } });
            const emp_list = await MdEmp.find().sort({ emp_code: 1 });
            let report_type = '0';
            let header = 'Report By Employe & Project';
            let link = '/report_emp_view';
            res.render('report/report_in', { project_list, emp_list, report_type, header, link });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})
app.get('/report_pro', async (req, res) => {
    try {
        let user = req.session.user;
        // console.log(user);
        if (user && user.user_type == 'A') {
            const project_list = await ProMaster.find().sort({ name: 1 });
            // EMP LIST WHERE NOT USER
            // const emp_list = await MdEmp.find({ emp_code: { $ne: user.emp_code } });
            const emp_list = await MdEmp.find().sort({ emp_code: 1 });
            let report_type = '2';
            let header = 'Report By Project';
            let link = '/report_emp_view';
            res.render('report/report_in', { project_list, emp_list, report_type, header, link });
        } else { res.redirect('/login'); }
    } catch {
        res.status(400).render("400");
    }
})

/////////////////////// AJAX ///////////////////////////////////
// CHECK USER
app.get('/check_user', async (req, res) => {
    try {
        const check_data = await MdEmp.findOne({ emp_code: req.query.emp_id });
        const user_data = await Register.findOne({ emp_code: req.query.emp_id });
        const is_reg = user_data ? 1 : 0;
        // console.log({ check_data, is_reg });
        res.send({ check_data, is_reg })
    } catch {
        res.status(400).send(req.query);
    }

})
// GET PROJECT ID
app.get('/get_project_id', async (req, res) => {
    try {
        const project_id = await ProMaster.find().sort({ project_code: -1 }).limit(1);
        res.status(200).send(project_id);
    } catch {
        res.status(400).send('Error');
    }
})
// SET PROJECT IS ACTIVE OR NOT
app.get('/set_isactive', async (req, res) => {
    try {
        var project_data = await ProMaster.findOne({ project_code: req.query.id });
        var isactive = (project_data.isactive > 0) ? 0 : 1;
        // res.send(JSON.stringify(project_data));
        if (await ProMaster.updateOne({ project_code: req.query.id }, { isactive: isactive })) {
            res.send({ isdone: 1 });
        } else {
            res.send({ isdone: 0 });
        }
    } catch (err) {
        console.log({ 'msg': err });
    }
})

////////////////////////////// TEST ALGO /////////////////////////////////////
const rand_value = (data) => {
    return data[Math.floor(Math.random() * data.length)];
}
app.get('/test_algo', (req, res) => {
    var all_data = [1, 2, 3, 4, 5, 6, 7, 8];
    var pres_arr = [];
    var rand_data = '';
    // console.log('1' + rand_value(all_data));
    // console.log('2' + rand_value(all_data));

    // pres_arr.push(rand_value(all_data));
    for (var i = 0; i < (all_data.length / 2); i++) {
        // pres_arr = all_data[Math.floor(Math.random() * all_data.length)];
        rand_data = rand_value(all_data);
        if (pres_arr.length > 0) {
            pres_arr.forEach((d) => {
                if (d === rand_data) {
                    pres_arr.push(all_data[Math.floor(Math.random() * all_data.length)])
                } else {
                    pres_arr.push(rand_data);
                }
            })
        }
        if (pres_arr.hasOwnProperty(rand_data)) {
            // console.log(pres_arr.hasOwnProperty(rand_data) + rand_data);
            console.log(pres_arr);
            pres_arr.push(all_data[Math.floor(Math.random() * all_data.length)]);
        } else {
            console.log('Not Found' + rand_data);
            // console.log(pres_arr.hasOwnProperty(rand_data) + rand_data);
            pres_arr.push(rand_data);
        }
        // if (pres_arr.indexOf(rand_data) >= 0) {
        //     pres_arr.push(all_data[Math.floor(Math.random() * all_data.length)]);
        //     // console.log("Found" + rand_data);
        // } else {
        //     pres_arr.push(rand_data);
        //     // console.log("Not found" + rand_data);
        // }
        // console.log('Data' + all_data[Math.floor(Math.random() * all_data.length)]);
    }
    pres_arr.forEach((d) => {
        console.log(d);
    })
    // console.log(pres_arr[0]);
})

app.listen(port, () => {
    console.log(`App is listning at ${port}`);
})