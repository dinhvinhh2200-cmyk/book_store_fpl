const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authController = {
    showRegister: (req , res) => {
        res.render('auth/register')
    },

    showLogin: (req, res) => {
        const success = req.query.success === '1'
        res.render('auth/login', {success})
    },

    // logic dang ky
    register: async(req, res) => {
        try {
            const {email , password} = req.body
            const name = req.body.name ? req.body.name.trim() : ''

            // kiem tra dinh dang email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.render('auth/register', {error:'email ko hop le'})
            }

            if (name.length < 2) {
                return res.render('auth/register', {error: 'Ten nguoi dung qua ngan', oldData: req.body})
            }

            const existingUserName = await User.findByUsername(name)
            if (existingUserName) {
                return res.render('auth/register', {
                    error: 'Tên người dùng đã tồn tại, vui lòng nhập tên khác!',
                    oldData: req.body
                })
            }

            // kiem tra do dai mk 
            if (password.length < 6) {
                return res.render('auth/register', {error:'mk phai co toi thieu 6 ky tu'})
            }

            // kiem tra xem email da ton tai chua
            const existingUser = await User.findByEmail(email)
            if (existingUser) {
                return res.render('auth/register', {error: 'Email nay da duoc su dung!'})
            }

            // ma hoa mk
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password , salt)

            // luu vao db
            await User.create({name , email , password: hashedPassword})
            res.redirect('/auth/login?success=1')
        }catch (error) {
            console.error(error)
            res.render('auth/register', {error: 'co loi xay ra, vui long thu lai'})
        }
    },

    // logic dn
    login: async (req, res) => {
        try {
            const {email , password} = req.body

            // kta nguoi dung co ton tai ko
            const user = await User.findByEmail(email)
            if (!user) {
                return res.render('auth/login', {error: 'email hoac mk ko dung'})
            }

            // so sanh mk nhap voi mk da ma hoa
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.render('auth/login', {error:'email hoac mk ko dung'})
            }

            // tao payload (thong tin chua trong token)
            const payload = {
                id: user.id,
                name: user.role === 'admin' ? 'admin' : user.name,
                role: user.role 
            }

            // ky token
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'SECRET_KEY',
                {expiresIn: '7d'}
            );

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            if (user.role === 'admin') {
                return res.redirect('/admin')
            }else {
                return res.redirect('/')
            }

            res.redirect('/')
        }catch (error) {
            console.error(error)
            res.render('auth/login', {error:'co loi xay ra, vui long thu lai'})
        }
    },

    logout: (req, res) => {
        res.clearCookie('token')
        res.redirect('/auth/login')
    }

}
module.exports = authController