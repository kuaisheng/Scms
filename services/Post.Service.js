const mongodb = require("mongodb");
const assert = require("assert")
const config = require('../config/db.config');
const objectID = require('mongodb').ObjectID;

const url = config.dataDB; //database url
const dbName = config.postCollection;

class PostService{

    get_post_firstPage( pgNum, fail, success){
        let data = {num:0,articles:[]}
        mongodb.connect(url, (err,db) =>{

            assert.equal(null, err);
            const collection = db.collection(dbName); 
            const perPage = 5;
            const offset = ( pgNum - 1 ) * perPage;
            
            collection.find()
                      .count()
                      .then( doc =>{

                            data.num = doc;
                            collection.find({}, { skip:offset, limit:perPage })
                                      .toArray()
                                      .then( doc =>{
                                            data.articles = doc;
                                            success(data);
                                            db.close();
                                      })
                                      .catch( err =>{
                                            fail(err);
                                            db.close();
                                      });
                      })
                      .catch( err =>{
                            fail({status:"err",content:err});
                            db.close();
                      } );
        }); 
    }

    get_post_morePage(pgNum,success,fail){
        let data = {num:0,articles:[]}
        mongodb.connect(url,(err,db) =>{
            assert.equal(null, err);
            const collection = db.collection(dbName); 

            collection.find()
                      .count()
                      .then( doc =>{
                            data.num = doc;
                            const skipNum = (doc - pgNum * 5) < 0 ? 0:doc - pgNum * 5;
                            const limitNum = (doc - pgNum * 5) < 0 ? (doc - (pgNum-1) * 5):5;

                            collection.find({},{skip:skipNum,limit:limitNum})
                                      .toArray()
                                      .then( doc =>{
                                            data.articles = doc
                                            success({status:"ok",content:"Post Loaded",result:data});
                                            db.close();
                                      })
                                      .catch( err =>{
                                            fail({status:"err",content:err});
                                            db.close();
                                      });
                      })
                      .catch( err =>{
                        fail({status:"err",content:err});
                        db.close();
                      });
        }); 
    }

    get_post_admin(pgNum,success,fail){
        mongodb.connect(url,(err,db) =>{
            const collection = db.collection(dbName);
            collection.find({}).toArray((err,doc) => {
                if (err){
                    fail({status:"err",content:"出现错误"})
                }else{
                    const startNum = pgNum * 10 - 10 <= 0 ? 0:pgNum * 10 - 10;
                    const data = {
                        hasFst:pgNum - 1 >= 2 ? true:false,
                        hasLast:pgNum - 1 >= 1 ? true:false,
                        hasNxt:doc.length - pgNum * 10 > 1 ? true:false,
                        hasLst:doc.length / 10 + 1 - pgNum >= 2 ? true:false,
                        lastPg:Math.floor(doc.length / 10) + 1,
                        currentArticles:doc.reverse().slice(startNum,startNum + 10)
                    };
                    success({status:"ok",content:"获得文章数据",result:data});
                }
                db.close();
            });
        });
    }

    get_post_byCategories(cgNum,pgNum,success,fail){
        mongodb.connect(url,(err,db) =>{
            const settingCollection = db.collection(config.settingCollection);
            settingCollection.findOne({},{categories:{$elemMatch:{id:cgNum}}}).then((doc,err) => {
                const collection = db.collection(dbName);
                const cgName = doc.categories[0].name;
                collection.find({category:cgName}).toArray((err,doc) => {
                    if (err){
                        fail({status:"err",content:"出现错误"})
                    }else{
                        const startNum = pgNum * 5 - 5 <= 0 ? 0:pgNum * 5 - 5;
                        const data = {
                            cg:cgName,
                            hasFst:pgNum - 1 >= 2 ? true:false,
                            hasLast:pgNum - 1 >= 1 ? true:false,
                            hasNxt:doc.length - pgNum * 5 > 1 ? true:false,
                            hasLst:doc.length / 5 + 1 - pgNum >= 2 ? true:false,
                            lastPg:Math.floor(doc.length / 5) + 1,
                            currentArticles:doc.reverse().slice(startNum,startNum + 5)
                        };
                        success({status:"ok",content:"获得文章数据",result:data});
                    }
                    db.close();
                });
            })
        });
    }

    get_post_byDate(date,pgNum,success,fail){
        try {
            const startDate = new Date(`${date.replace(/-/g," ")} 00:00:00`).getTime()/1000; 
            const startDateID = objectID(startDate);//转换日期id
            const newDateID = objectID(startDate + 86400); //转换下一天id
            mongodb.connect(url,(err,db) =>{
                const collection = db.collection(dbName);
                collection.find({_id:{$gte:startDateID,$lt:newDateID}}).toArray((err,doc) => {
                    if (err){
                        fail({status:"err",content:"出现错误"})
                    }else{
                        const startNum = pgNum * 5 - 5 <= 0 ? 0:pgNum * 5 - 5;
                        const data = {
                            date,
                            hasFst:pgNum - 1 >= 2 ? true:false,
                            hasLast:pgNum - 1 >= 1 ? true:false,
                            hasNxt:doc.length - pgNum * 5 > 1 ? true:false,
                            hasLst:doc.length / 5 + 1 - pgNum >= 2 ? true:false,
                            lastPg:Math.floor(doc.length / 5) + 1,
                            currentArticles:doc.reverse().slice(startNum,startNum + 5)
                        };
                        success({status:"ok",content:"获得文章数据",result:data});
                    }
                    db.close();
                })
            });
        }catch (err){
            fail({status:"err",content:"出现错误"})
        }
        
    }

    get_post_byKyWrds(kyWrds,pgNum,success,fail){
        let keywords = kyWrds.split("+");
        for (let i = 0;i<keywords.length;i++){
            keywords[i] = new RegExp(keywords[i],"gi");
        }
        mongodb.connect(url,(err,db) =>{
            const collection = db.collection(dbName);
            collection.find({$or:[{content:{$all:keywords}},{title:{$all:keywords}}]}).toArray((err,doc) => {
                if (err){
                    fail({status:"err",content:"出现错误"})
                }else{
                    const startNum = pgNum * 5 - 5 <= 0 ? 0:pgNum * 5 - 5;
                    const data = {
                        hasFst:pgNum - 1 >= 2 ? true:false,
                        hasLast:pgNum - 1 >= 1 ? true:false,
                        hasNxt:doc.length - pgNum * 5 > 1 ? true:false,
                        hasLst:doc.length / 5 + 1 - pgNum >= 2 ? true:false,
                        lastPg:Math.floor(doc.length / 5) + 1,
                        currentArticles:doc.reverse().slice(startNum,startNum + 5)
                    };
                    success({status:"ok",content:"获得搜索数据",result:data});
                }
                db.close();
            })
        });
    }

    get_post_one(id,ip,successs,fail){
        
            let hasError = false;
            let data = {};
            mongodb.connect(url,(err,db) =>{
                assert.equal(null, err);
                const collection = db.collection(dbName);
                try {
                    collection.find({_id:{$gt:objectID(id)}},{limit:1,fields:{_id:1,title:1}}).toArray((err,doc) => {
                        //获得下一篇文章
                        if (err && !hasError){
                            hasError = true;
                            fail({status:"err",content:"出现错误"});
                        }else{
                            data.nxtArticle = doc.length == 0 ? "No Result" : doc[0]
                        }
                        if (Object.keys(data).length == 3){
                            successs({status:"ok",content:"文章数据获得",data});
                        }
                    });

                    collection.findAndModify({_id:objectID(id)},[],{$inc:{click:1}},{ new: true },(err,doc) => {
                        if (err){
                            hasError = true;
                            fail({status:"err",content:"出现错误"});
                        }else{
                            let article = doc.value;
                            
                            if ( doc.value.comments.length != 0 ){
                                //检查ip是否已经点赞主评论

                                let comments = []
                                doc.value.comments.forEach(comment =>{
                                    const liked = comment.like.ip.findIndex(liked => liked == ip) !== -1 ? true:false;
                                    let newComment = {
                                        _id:comment._id,
                                        title:comment.title,
                                        name:comment.name,
                                        content:comment.content,
                                        like:{
                                            liked,
                                            num:comment.like.num,
                                        }
                                    };
                                    if ( Object.keys(comment.comments).length != 0 ){
                                        let subComments = {};
                                        for (let sub in comment.comments){
                                            const subliked = comment.comments[sub].like.ip.findIndex(liked => liked == ip) !== -1 ? true:false;
                                            subComments[sub] = {
                                                title:comment.comments[sub].title,
                                                name:comment.comments[sub].name,
                                                content:comment.comments[sub].content,
                                                like:{
                                                    liked:subliked,
                                                    num:comment.comments[sub].like.num,
                                                }
                                            };
                                        }
                                        newComment.comments = subComments;
                                    }
                                    comments.push(newComment);
                                });
                                article.comments = comments;
                            }
                            data.article = article;
                        }
                        if (Object.keys(data).length == 3){
                            successs({status:"ok",content:"文章数据获得",data});
                        }
                    });

                    collection.find({_id:{$lt:objectID(id)}},{limit:1,fields:{_id:1,title:1}}).sort({_id:-1}).toArray((err,doc) => {
                        //获得上一篇文章
                        if (err && !hasError){
                            hasError = true;
                            fail({status:"err",content:"出现错误"});
                        }else{
                            data.lstArticle = doc.length == 0 ? "No Result" : doc[0]
                        }

                        if (Object.keys(data).length == 3){
                            successs({status:"ok",content:"文章数据获得",data});
                        }
                    });
                } catch (e) {
                    if (!hasError){
                        hasError = true;
                        fail({status:"err",content:"错误id"});
                    }
                }
            });

    }

    create_new_post(data,success,fail){
        data.comments = [];
        data.click = 0;

        mongodb.connect(url,(err,db) =>{
            assert.equal(null,err);
            const collection = db.collection(dbName); 

            collection.insertOne( data )
                      .then( doc  =>{
                            success({status:"ok",content:"文章发表成功"});
                      }).catch( err =>{
                            fail({status:"err",content:"出现错误"});
                      });
        });
    }

    update_post(data){

        return new Promise( (resolve, reject) =>{

            try {
                mongodb.connect(url,(err,db) =>{
                    assert.equal(null,err);
                    const collection = db.collection(dbName); 
    
                    collection.updateOne( 
                        { _id: objectID(data.id) },
                        { $set: {
                            title:data.title,
                            content:data.content,
                            category:data.category,
                            allowComments:data.allowComments,
                            allowSubComments:data.allowSubComments,
                            attachments:data.attachments
                            }})
                            .then( doc =>{
                                resolve('文章修改成功');
                            })
                            .catch( err =>{
                                reject('出现错误');
                            });
                });
    
    
            }catch(err){
                reject('无效文章ID');
            }

        });
    }

    del_post(id,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.deleteOne({_id:objectID(id)}).then((doc,err) => {
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"文章删除成功"});
                    }
                });
            }); 
        }catch (err){
            fail({status:"err",content:"错误id"})
        }

    }

    create_comment(data,success,fail){
        try {
            const commentID = Date.now() / 1000;
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne(
                    {_id:objectID(data.id)},
                    {$push:{
                        comments:{
                            "_id":objectID(commentID),
                            "title":data.title,
                            "name":data.name,
                            "content":data.content,
                            "comments":[],
                            "uploadFiles":[],
                            "like":{num:0,ip:[]}
                        }
                    }
                }).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"评论发表成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }

    create_subcomment(id,data,success,fail){
        try {
            let query = {};
            const subCommentID = Date.now() / 1000;
            query[objectID(subCommentID)] = {
                name:data.name,
                content:data.content,
                like:{
                    num:0,
                    ip:[]
                }
            };
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne({_id:objectID(id),"comments._id":objectID(data.id)},{$set:{"comments.$.comments":query}}).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"评论发表成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }

    delete_comment_all(id,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne({_id:objectID(id)},{$set:{comments:[]}}).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"评论清空成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }

    delete_sub_comment_all(id,commentid,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne({_id:objectID(id),"comments.$._id":objectID(commentid)},{$set:{"comments.$.comments":[]}}).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"子评论清空成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }


    delete_comment(id,commentId,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne({_id:objectID(id)},{$pull:{comments:{_id:objectID(commentId)}}}).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"评论删除成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }

    delete_sub_comment(params,success,fail){
        try {
            let query = {};
            query[`comments.$.comments.${params.subid}`] = "";
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName); 
                collection.updateOne({"comments._id":objectID(params.commentid)},{$unset:query}).then((doc,err) =>{
                    if (err){
                        fail({status:"err",content:"出现错误"});
                    }else{
                        success({status:"ok",content:"子评论删除成功"});
                    }
                });
            });
        }catch (err){
            fail({status:"err",content:"错误id"})
        }
    }

    like_comment(data,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName);
                collection.findOne({"comments._id":objectID(data.commentid)},{"comments.$":1}).then((doc,err) =>{
                    let like = doc.comments[0].like;
                    const ipIndex = doc.comments[0].like.ip.findIndex(likeip => likeip === data.ip);
                    if ( ipIndex == -1){
                        like.num += 1;
                        like.ip.push(data.ip);
                    }else{
                        like.num -=1;
                        like.ip.splice(ipIndex,1);
                    }

                    collection.updateOne({_id:objectID(data.id),"comments._id":objectID(data.commentid)},{$set:{"comments.$.like":like}}).then((doc,err) =>{
                        if (err){
                            fail({status:"err",content:"出现错误"});
                        }else{
                            success({status:"ok",content:"评论点赞成功"});
                        }
                    });
                });
            });
        }catch (err){
            fail({status:"err",content:"出现错误"});
        }
    }

    like_sub_comment(data,success,fail){
        try {
            mongodb.connect(url,(err,db) =>{
                assert.equal(null,err);
                const collection = db.collection(dbName);
                collection.findOne({"comments._id":objectID(data.commentid)},{"comments.$.comments":1}).then((doc,err) => {
                    let sublike = doc.comments[0].comments[data.subid].like;
                    const ipIndex = sublike.ip.findIndex(likeip => likeip === data.ip);
                    if ( ipIndex == -1){
                        sublike.num += 1;
                        sublike.ip.push(data.ip);
                    }else{
                        sublike.num -=1;
                        sublike.ip.splice(ipIndex,1);
                    }

                    let query = {};
                    query[`comments.$.comments.${data.subid}.like`] = sublike;
                    console.log(query);
                    collection.updateOne({"comments._id":objectID(data.commentid)},{$set:query}).then((doc,err) =>{
                        if (err){
                            fail({status:"err",content:"出现错误"});
                        }else{
                            success({status:"ok",content:"子评论点赞成功"});
                        }
                    });
                });
            });
        }catch (err){
            fail({status:"err",content:"出现错误"});
        }
    }
}

module.exports = {PostService:PostService};