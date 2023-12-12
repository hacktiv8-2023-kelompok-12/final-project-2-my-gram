const request = require("supertest");
const {describe, it, expect, afterAll} = require("@jest/globals");
const app = require("../bin/express");
const {User} = require("../models");
const {verify_token} = require("../lib/crypto");
const testUser = {
    email: "unittest@mail.com",
    full_name: "unit test",
    username: "unit_test",
    password: "unittest1234",
    profile_image_url: "https://image.com/unittest",
    age: 10,
    phone_number: "081234567890"
};

describe("POST user register", () => {
    it("should be success", (done) => {
        request(app)
            .post("/users/register")
            .send(testUser)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("user");
                expect(res.body.user).not.toHaveProperty("password");
                expect(res.body.user).toHaveProperty("email");
                expect(typeof res.body.user.email).toBe("string");
                done();
            });
    });
    it("should be failed", (done) => {
        request(app)
            .post("/users/register")
            .send(testUser)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(409);
                expect(res.body).not.toHaveProperty("user");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("email is used");
                done();
            });
    });
});

let userToken = "";
let userId = 0;
describe("POST user login", () => {
    it('should be success', (done) => {
        request(app)
            .post("/users/login")
            .send({
                email: "unittest@mail.com", password: "unittest1234"
            })
            .end(async (err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("token");
                const tokenPayload = await verify_token(res.body.token);
                expect(tokenPayload).toHaveProperty("id");
                expect(tokenPayload).not.toHaveProperty("email");
                const userData = await User.findByPk(tokenPayload.id, {});
                expect(userData).not.toBeNull();
                userId = tokenPayload.id;
                userToken = res.body.token;
                done();
            });
    });
    it('should be failed', (done) => {
        request(app)
            .post("/users/login")
            .send({
                email: "unittest123@mail.com", password: "unittest1234"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(res.body).not.toHaveProperty("token");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("user not found");
                done();
            });
    });
});

describe("PUT user update", () => {
    it('should be success', (done) => {
        request(app)
            .put(`/users/${userId}`)
            .set("token", userToken)
            .send({
                ...testUser, age: 15
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("user");
                expect(res.body.user).not.toHaveProperty("password");
                expect(res.body.user).toHaveProperty("age");
                expect(res.body.user.age).toBe(15);
                done();
            });
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .put(`/users/${userId}`)
            .send({
                ...testUser, age: 15
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(res.body).not.toHaveProperty("user");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .put(`/users/${userId + 1}`)
            .set("token", userToken)
            .send({
                ...testUser, age: 15
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(res.body).not.toHaveProperty("user");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
});

describe('DELETE user delete', () => {
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .delete(`/users/${userId}`)
            .send({
                ...testUser, age: 15
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(res.body).not.toHaveProperty("user");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .delete(`/users/${userId + 1}`)
            .set("token", userToken)
            .send({
                ...testUser, age: 15
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(res.body).not.toHaveProperty("user");
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be success', (done) => {
        request(app)
            .delete(`/users/${userId}`)
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(Object.keys(res.body)).toHaveLength(1);
                expect(res.body).toHaveProperty("message");
                expect(typeof res.body.message).toBe("string");
                expect(res.body.message).toBe("Your account has been successfully deleted");
                done();
            });
    });
});

afterAll(async () => {
    await User.destroy({
        where: {}
    });
});