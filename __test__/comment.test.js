const request = require("supertest");
const {describe, it, expect, afterAll, beforeAll} = require("@jest/globals");
const app = require("../bin/express");
const {User, Photo, Comment} = require("../models");
const {sign_token} = require("../lib/crypto");
const testComment = {
    comment: "this is comment",
    PhotoId: 0
}

let userToken = "";
let wrongToken = "";
let photoId = 0;
let commentId = 0;
beforeAll(async () => {
    const newUser = await User.create({
        email: "unittest@mail.com",
        full_name: "unit test",
        username: "unit_test",
        password: "unittest1234",
        profile_image_url: "https://image.com/unittest",
        age: 10,
        phone_number: "081234567890"
    });
    const wrongUser = await User.create({
        email: "wronguser@mail.com",
        full_name: "wrong user",
        username: "wrong_user",
        password: "wronguser1234",
        profile_image_url: "https://image.com/unittest",
        age: 10,
        phone_number: "081234567890"
    });
    const newPhoto = await Photo.create({
        title: "unit test photo",
        caption: "this is unit test",
        poster_image_url: "https://unittest.com/poster",
        UserId: newUser.id
    });
    userToken = await sign_token({id: newUser.id});
    wrongToken = await sign_token({id: wrongUser.id});
    photoId = newPhoto.id;
    testComment.PhotoId = photoId;
});

describe('POST comment create', () => {
    it('should be success', (done) => {
        request(app)
            .post("/comments")
            .set("token", userToken)
            .send(testComment)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("comment");
                expect(res.body.comment).toHaveProperty("comment");
                expect(res.body.comment["comment"]).toBe(testComment.comment);
                expect(res.body.comment).toHaveProperty("UserId");
                expect(res.body.comment).toHaveProperty("PhotoId");
                expect(res.body.comment["PhotoId"]).toBe(testComment.PhotoId);
                commentId = res.body.comment.id;
                done();
            });
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .post("/comments")
            .send(testComment)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [validation]', (done) => {
        request(app)
            .post("/comments")
            .set("token", userToken)
            .send({...testComment, PhotoId: photoId + 1})
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(201);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("photo not found");
                done();
            });
    });
});

describe('GET comment get all', () => {
    it('should be success', (done) => {
        request(app)
            .get("/comments")
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("comments");
                expect(res.body.comments).toHaveLength(1);
                expect(res.body.comments[0]).toHaveProperty("Photo");
                expect(res.body.comments[0]["Photo"]).toHaveProperty("id");
                expect(res.body.comments[0]["Photo"].id).toBe(photoId);
                expect(res.body.comments[0]).toHaveProperty("User");
                done();
            })
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .get("/comments")
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            })
    });
});

describe('PUT comment update', () => {
    it('should be success', (done) => {
        request(app)
            .put(`/comments/${commentId}`)
            .set("token", userToken)
            .send({
                ...testComment,
                comment: "this is updated comment"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("comment");
                expect(res.body.comment).toHaveProperty("comment");
                expect(res.body.comment.comment).toBe("this is updated comment");
                expect(res.body.comment).toHaveProperty("PhotoId");
                expect(res.body.comment["PhotoId"]).toBe(photoId);
                done();
            })
    });
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .put(`/comments/${commentId}`)
            .send({
                ...testComment,
                comment: "this is updated comment"
            })
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .put(`/comments/${commentId}`)
            .set("token", wrongToken)
            .send({
                ...testComment,
                comment: "this is updated comment"
            })
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .put(`/comments/${commentId + 1}`)
            .set("token", userToken)
            .send({
                ...testComment,
                comment: "this is updated comment"
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("comment not found");
                done();
            });
    });
});

describe('DELETE comment delete', () => {
    it('should be failed [unauthorized]', (done) => {
        request(app)
            .delete(`/comments/${commentId}`)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(401);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("unauthorized");
                done();
            });
    });
    it('should be failed [forbidden]', (done) => {
        request(app)
            .delete(`/comments/${commentId}`)
            .set("token", wrongToken)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(403);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("forbidden");
                done();
            });
    });
    it('should be failed [not found]', (done) => {
        request(app)
            .delete(`/comments/${commentId + 1}`)
            .set("token", userToken)
            .end((err, res) => {
                if (err) done(err);
                expect(res.status).not.toBe(200);
                expect(res.status).toBe(404);
                expect(Object.keys(res.body)).toHaveLength(2);
                expect(res.body).toHaveProperty("message");
                expect(res.body.message).toBe("comment not found");
                done();
            });
    });
    it('should be success', (done) => {
        request(app)
            .delete(`/comments/${commentId}`)
            .set("token", userToken)
            .end((err, res) => {
                if(err) done(err);
                expect(res.status).toBe(200);
                expect(Object.keys(res.body)).toHaveLength(1);
                expect(res.body).toHaveProperty("message");
                expect(typeof res.body.message).toBe("string");
                expect(res.body.message).toBe("Your comment has been successfully deleted");
                done();
            });
    });
//     TODO 3 failed condition
});

afterAll(async () => {
    await Comment.destroy({where: {}});
    await Photo.destroy({where: {}});
    await User.destroy({where: {}});
});