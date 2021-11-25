const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const {User, Basket, Device, BasketDevice} = require('../models/models');
const jwt = require('jsonwebtoken');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    );
};

class BasketController {
    async addDevice(req, res, next) {
        try {
            const deviceId = req.body.id;
            const {id, email, role} = req.user;
            const basket = await Basket.findOne({where: {userId: id}});
            const device = await Device.findOne({where: {id: deviceId}});

            let basketDevice = await BasketDevice.findOne({where: {basketId: basket.id, deviceId: device.id}});
            if (basketDevice) {
                await basketDevice.increment({'quantity': 1});
            } else {
                basketDevice = await BasketDevice.create({basketId: basket.id, deviceId: device.id, quantity: 1});
            }
            basketDevice = await BasketDevice.findAll({where: {basketId: basket.id}});
            const basketDeviceId = basketDevice.map(elem => elem.deviceId);
            const devices = await Device.findAll({
                where: {id: basketDeviceId},
                include: [{
                    model: BasketDevice
                }]
            });

            const token = generateJwt(id, email, role);
            return res.json({token, devices});
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async removeDevice(req, res, next) {
        try {
            const deviceId = req.body.id;
            const {id, email, role} = req.user;
            const basket = await Basket.findOne({where: {userId: id}});
            const device = await Device.findOne({where: {id: deviceId}});

            let basketDevice = await BasketDevice.findOne({where: {basketId: basket.id, deviceId: device.id}});
            if (basketDevice && basketDevice.quantity > 1) {
                await basketDevice.decrement({'quantity': 1});
            } else {
                basketDevice = await BasketDevice.destroy({where: {basketId: basket.id, deviceId: device.id}});
            }
            basketDevice = await BasketDevice.findAll({where: {basketId: basket.id}});
            const basketDeviceId = basketDevice.map(elem => elem.deviceId);
            const devices = await Device.findAll({
                where: {id: basketDeviceId},
                include: [{
                    model: BasketDevice
                }]
            });

            const token = generateJwt(id, email, role);
            return res.json({token, devices});
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getBasketList(req, res, next) {
        try {
            const {id, email, role} = req.user;
            const basket = await Basket.findOne({where: {id}});
            const basketDevice = await BasketDevice.findAll({where: {basketId: basket.id}});
            const basketDeviceId = basketDevice.map(elem => elem.deviceId);
            const devices = await Device.findAll({
                where: {id: basketDeviceId},
                include: [{
                    model: BasketDevice
                }]
            });
            const token = generateJwt(id, email, role);
            return res.json({token, devices});
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        return res.json({token});
    }
}

module.exports = new BasketController();