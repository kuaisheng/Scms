<template>
    <div class='post-editor'>
        <div v-if='isEditing'>
            <input placeholder="输入标题" class='form-control' v-model='postTitle'>
            <slot></slot>
            <Image-Upload v-if='postCoverImg' :preload='imageUploadParams' :unUploaded='previewImgs.unUploadedAttachments' :unUploadedTitle='unUploadedAttachmentTitles' />
            <div class='post-content-editor-btns'>
                <div class="dropdown" v-if='hasPreload && preLoads.categoryList.length > 0'>
                    <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        {{category}} <span class="caret" v-if='category === "文章分类"'></span>
                    </button>&nbsp;
                    <ul class="dropdown-menu" v-if='hasPreload && this.preLoads.categoryList.length > 0'>
                        <li @click='selectCategories(cg.name)'  v-for='(cg, categoryIndex) in preLoads.categoryList' :key='`category-${categoryIndex}`'>
                            <a href="javascript:void(0)">{{cg.name}}</a>
                        </li>
                    </ul>
                </div>

                <div class="dropdown">
                    <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        字号
                    </button>
                    <ul class="dropdown-menu">
                        <li @click='addFontSize("90%")'><a href="javascript:void(0)">90%</a></li>
                        <li @click='addFontSize("110%")'><a href="javascript:void(0)">110%</a></li>
                        <li @click='addFontSize("120%")'><a href="javascript:void(0)">120%</a></li>
                        <li @click='addFontSize("130%")'><a href="javascript:void(0)">130%</a></li>
                        <li @click='addFontSize("140%")'><a href="javascript:void(0)">140%</a></li>
                        <li @click='addFontSize("150%")'><a href="javascript:void(0)">150%</a></li>
                        <li @click='addFontSize("custom")'><a href="javascript:void(0)">自定义</a></li>
                    </ul>
                </div>&nbsp;
                
                <div class="dropdown">
                    <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        颜色
                    </button>
                    <ul class="dropdown-menu">
                        <li style='background-color:#808080;' @click='addColor("#808080")'><a href="javascript:void(0)" style='color:#fff;'>灰</a></li>
                        <li style='background-color:#FFFF00;' @click='addColor("#FFFF00")'><a href="javascript:void(0)">黄</a></li>
                        <li style='background-color:#FF0000;' @click='addColor("#FF0000")'><a href="javascript:void(0)" style='color:#fff;'>红</a></li>
                        <li style='background-color:#008000;' @click='addColor("#008000")'><a href="javascript:void(0)" style='color:#fff;'>绿</a></li>
                        <li style='background-color:#0000FF;' @click='addColor("#0000FF")'><a href="javascript:void(0)" style='color:#fff;'>蓝</a></li>
                        <li style='background-color:#800080;' @click='addColor("#800080")'><a href="javascript:void(0)" style='color:#fff;'>紫</a></li>
                        <li @click='addColor("custom")'><a href="javascript:void(0)">自定义</a></li>
                    </ul>
                </div>&nbsp;

                <button class='btn btn-default btn-sm' @click='addBold' title='bold'><i class='fa fa-bold'></i></button>&nbsp;
                <button class='btn btn-default btn-sm' @click='addItalic' title='italic'><i class='fa fa-italic'></i></button>&nbsp;
                <button class='btn btn-default btn-sm' @click='addUnderLine' title='underline'><i class='fa fa-underline'></i></button>&nbsp;
                <div class="dropdown">
                    <button class='btn btn-default btn-sm' @click='openUrlDropDown' title='url'><i class='fa fa-link'></i></button>
                    <div id='urlInput' class='dropdown-menu' v-if='showUrlInput' style='display:block'>
                        <div><br />
                            <input placeholder="链接文字" class='form-control' v-model='urlText'>
                            <input placeholder="链接地址" class='form-control' v-model='urlLink'>
                            <button class='btn btn-default btn-sm' @click='addUrl'>确认</button>&nbsp;
                            <button class='btn btn-default btn-sm' @click='openUrlDropDown'>取消</button>
                        </div>
                        <br />
                    </div>
                </div>&nbsp;
                <button class='btn btn-default btn-sm' @click='addCode' title='code'><i class='fa fa-code'></i></button>&nbsp;
                <button class='btn btn-default btn-sm' @click='addQuote' title='quote'><i class='fa fa-quote-left'></i></button>&nbsp;
                <div class="dropdown">
                    <button class='btn btn-default btn-sm' @click='openImgDropDown' title='image'><i class='fa fa-file-image-o'></i></button>
                    <div id='imgInput' class='dropdown-menu' v-if='showImgInput' style='display:block'>
                        <div><br />
                            <input placeholder="图片描述" class='form-control' v-model='imgAlt'>
                            <input placeholder="图片链接" class='form-control' v-model='imgLink'>
                            <input class='form-control' placeholder="宽度" style='width:30%;' v-model='imgWidth'><input class='form-control' placeholder='长度' style='width:30%;' v-model='imgHeight'>
                            <button class='btn btn-default btn-sm' @click='addImg'>确认</button>&nbsp;
                            <button class='btn btn-default btn-sm' @click='openImgDropDown'>取消</button>
                        </div>
                        <br />
                    </div>
                </div>&nbsp;
                <button class='btn btn-default btn-sm' @click='preview()'>预览</button>
            </div>
            
            <textarea placeholder="输入内容" class='form-control' id='editorArea' v-model='postContent'></textarea>
            <Attachments :previewImages='previewImgs' :removeImage='removeImage' :onUpload='onUpload' :onUseImage='onUseImage'/>
            <div class='post-btns'>
                <span style='float:left'>
                    <Result-View ref='resultView'></Result-View>
                </span>
                <button class='btn btn-default' @click='submitPost'>{{ preLoads.article !== undefined ? "保存":"发表" }}</button>&nbsp;
                <button class='btn btn-default' @click='cancel'>隐藏</button>&nbsp;
                <button class='btn btn-default' @click='clear'>清空</button>
            </div>
        </div>
        <div>
            <Preview v-if='isPreviewing' :title='postTitle' :content='postContent'></Preview>
            <div class='post-btns' v-if='isPreviewing'>
                <button class='btn btn-default' @click='preview'>取消预览</button>&nbsp;
                <button class='btn btn-default' @click='cancel'>撤销</button>
            </div>
        </div>
    </div>
</template>

<script>

    import updater from 'immutability-helper';

    import ResultView from "./resultview.vue";
    import Preview from "./preview.vue";
    import Attachments from "./postuploads.vue";
    import ImageUpload from "~/components/minorcomponents/imageupload.vue";

    export default {
        props:[
            'preLoads','categoryNeeded','preData'
        ],
        data(){
            const hasPreload = this.preLoads && this.preLoads.article;
            return{
                postTitle: hasPreload ? this.preLoads.article.title : '' ,
                postContent: hasPreload ? this.preLoads.article.content:'',
                category: hasPreload ? this.preLoads.article.category:'文章分类',
                postCoverImg:true,
                imageUploadParams:{
                    appendImages:this.appendImages,
                    multiple:true,
                    clearImages:this.clearImages,
                    accepts:'image/*',
                    onUpload:this.onUploadAll,
                },
                previewImgs:{
                    unUploadedAttachments:[],
                    uploadedAttachments:hasPreload && this.preLoads.article.attachments ? this.preLoads.article.attachments: [],
                },
                optionContent:"",
                selectionStart:0,
                selectionEnd:0,
                urlText:"",
                urlLink:"",
                imgAlt:"",
                imgLink:"",
                imgWidth:"",
                imgHeight:"",
                showUrlInput:false,
                showImgInput:false,
                isEditing:true,
                isPreviewing:false,
                resultMsg:"",
                hasMsg:false,
                errMsg:false,
                successMsg:false
            }
        },
        computed:{
            unUploadedAttachmentTitles(){
                return this.previewImgs.unUploadedAttachments.length <= 0 ? '':this.previewImgs.unUploadedAttachments.map( file => file.name ).join(',');
            },
            hasPreload(){
                return this.preLoads && this.preLoads.article;
            },
            hasCategory(){
                return this.preLoads.categoryList && this.preLoads.categoryList.length > 0;
            }
        },
        methods:{
            categoryOnchange(cg){
                this.category = cg;
            },
            cancel(){
                const cancelPost = this.preLoads.cancel === undefined ? this.$parent.editorCanel:this.preLoads.cancel;
                cancelPost();
            },
            clear(){
                this.postTitle = "",
                this.postContent = "";
            },
            preview(){
                this.isEditing = !this.isEditing;
                this.isPreviewing = !this.isPreviewing;
            },
            contentOnchange(str){
                this.postContent = str;
            },
            submitPost(){
                if (this.hasCategory && this.category == "文章分类"){
                    this.$refs.resultView.sendMsg("请选择文章分类","error");
                }else if (this.postContent == ""){
                    this.$refs.resultView.sendMsg("请输入内容","error");
                }else if (this.postTitle == ""){
                    this.$refs.resultView.sendMsg("请输入标题","error");
                }else{
                    const postData = this.hasCategory ? {
                        title:this.postTitle,
                        content:this.postContent,
                        category:this.category,
                        attachments:this.previewImgs.uploadedAttachments
                    } : {
                        title:this.postTitle,
                        content:this.postContent,
                        attachments:this.previewImgs.uploadedAttachments
                    }
                    
                    const submit = this.preLoads.submit || this.$parent.editorSubmit;
                    submit(postData,this.$refs.resultView.sendMsg);  
                }

            },
            selectCategories(category){
                this.category = category;
            },
            addFontSize(size){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                if (size != "custom"){
                    this.postContent = this.postContent.substring(0, selectionStart)
                        + `[s='${size}']` + this.postContent.substring(selectionStart, selectionEnd)
                        + '[/s]' + this.postContent.substring(selectionEnd);      
                }else{
                    const customSize = prompt('输入字体大小','100% 或 10px');
                    this.postContent = this.postContent.substring(0, selectionStart)
                        + `[s='${customSize}']` + this.postContent.substring(selectionStart, selectionEnd)
                        + '[/s]' + this.postContent.substring(selectionEnd);       
                }  
            },
            addColor(color){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                if (color != "custom"){
                    this.postContent = this.postContent.substring(0, selectionStart)
                        + `[c='${color}']` + this.postContent.substring(selectionStart, selectionEnd)
                        + '[/c]' + this.postContent.substring(selectionEnd);      
                }else{
                    const customColor = prompt('输入颜色代码','#000000');
                    this.postContent = this.postContent.substring(0, selectionStart)
                        + `[c='${customColor}']` + this.postContent.substring(selectionStart, selectionEnd)
                        + '[/c]' + this.postContent.substring(selectionEnd);       
                }
            },
            addBold(){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                this.postContent = this.postContent.substring(0, selectionStart)
                    + '[b]' + this.postContent.substring(selectionStart, selectionEnd)
                    + '[/b]' + this.postContent.substring(selectionEnd);
            },
            addItalic(){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                this.postContent = this.postContent.substring(0, selectionStart)
                    + '[i]' + this.postContent.substring(selectionStart, selectionEnd)
                    + '[/i]' + this.postContent.substring(selectionEnd);      
            },
            addUnderLine(){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                this.postContent = this.postContent.substring(0, selectionStart)
                    + '[u]' + this.postContent.substring(selectionStart, selectionEnd)
                    + '[/u]' + this.postContent.substring(selectionEnd);      
            },
            openUrlDropDown(){
                if (!this.showUrlInput){
                    const index = this.selectedTextIndex();
                    const selectionStart = index[0];
                    const selectionEnd = index[1];
                    this.selectionStart = selectionStart;
                    this.selectionEnd = selectionEnd;
                    this.urlText = this.postContent.substring(selectionStart, selectionEnd); //添加链接文字
                    this.urlLink = "";
                }
                this.showUrlInput = !this.showUrlInput;
            },
            addUrl(){
                this.postContent = this.postContent.substring(0, this.selectionStart) + `[url a='${this.urlLink}']${this.urlText}[/url]` + this.postContent.substring(this.selectionEnd);
                this.showUrlInput = false;
            },
            addQuote(){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                this.postContent = this.postContent.substring(0, selectionStart)
                    + '[quote]' + this.postContent.substring(selectionStart, selectionEnd)
                    + '[/quote]' + this.postContent.substring(selectionEnd);      
            },
            openImgDropDown(){
                if (!this.showImgInput){
                    const index = this.selectedTextIndex();
                    const selectionStart = index[0];
                    const selectionEnd = index[1];
                    this.selectionStart = selectionStart;
                    this.selectionEnd = selectionEnd;
                    this.imgAlt = this.postContent.substring(selectionStart, selectionEnd); //添加图片描述
                    this.imgLink = "";
                }
                this.showImgInput = !this.showImgInput;
            },
            addCode(){
                const index = this.selectedTextIndex();
                const selectionStart = index[0];
                const selectionEnd = index[1];
                this.postContent = this.postContent.substring(0, selectionStart)
                    + '[code]' + this.postContent.substring(selectionStart, selectionEnd)
                    + '[/code]' + this.postContent.substring(selectionEnd);  
            },
            addImg(){
                const width = this.imgWidth == "" || isNaN(this.imgWidth) ? "" : `w='${this.imgWidth}'`; //防止非数字长宽度
                const height = this.imgHeight == "" || isNaN(this.imgWidth) ? "": `h='${this.imgHeight}'`;
                this.postContent = this.postContent.substring(0, this.selectionStart) + `[img a='${this.imgAlt}' ${width} ${height}]${this.imgLink}[/img]` + this.postContent.substring(this.selectionEnd);
                this.showImgInput = false;
            },
            selectedTextIndex(){
                const editorArea = document.getElementById('editorArea');
                return [editorArea.selectionStart, editorArea.selectionEnd];
            },
            appendImages(images){
                
                this.previewImgs = updater( this.previewImgs, {
                    unUploadedAttachments:{
                        $push:Array.from(images)
                    }
                });
            },
            clearImages( type = 'unUploadedAttachments' ){
                this.previewImgs = updater( this.previewImgs, {
                    [type]:{ $set:[] }
                });
            },
            removeImage( index, attachmentType = 'unUploadedAttachments' ){
                this.previewImgs = updater( this.previewImgs,{
                    [attachmentType]:{
                        $splice:[ [index, 1] ]
                    }
                });
            },
            onUpload( e, index){

                const button = $(e.target);
                const orgText = button.text();
                button.prop('disabled', true).html('<i class="fa fa-circle-o-notch fa-spin"></i> 上传中...');

                const url = `/files/images`;
                const data = {
                    onTest:'1',
                    prefix:'post',
                    images:[this.previewImgs.unUploadedAttachments[index]]
                };

                this.$scms.Request.postFile( data, url ).then( res =>{
                    if ( res.status === 'ok' ){
                        this.previewImgs = updater( this.previewImgs, {
                            unUploadedAttachments:{
                                $splice:[[index, 1]]
                            },
                            uploadedAttachments:{
                                $push:res.result.images
                            }
                        });
                    }else{
                        alert('上传失败');
                    }
                    button.prop('disabled', false).text( orgText );
                }, () =>{
                    alert('上传失败');
                    button.prop('disabled', false).text( orgText );
                });
                
            },
            onUploadAll( event ){
                const button = $("#upload-all-images");
                const orgText = button.text();
                button.prop('disabled', true).html('<i class="fa fa-circle-o-notch fa-spin"></i> 上传中...');

                const url = `/files/images`;
                const data = {
                    onTest:'0',
                    prefix:'post',
                    images:this.previewImgs.unUploadedAttachments
                };
                this.$scms.Request.postFile( data, url ).then( res =>{
                    if ( res.status === 'ok' ){
                        this.previewImgs = updater( this.previewImgs, {
                            unUploadedAttachments:{
                                $set:[]
                            },
                            uploadedAttachments:{
                                $push:res.result.images
                            }
                        });
                    }

                    button.prop('disabled', false).text(orgText);
                }, () =>{
                    alert('上传出错');
                    button.prop('disabled', false).text(orgText);
                });
            },
            onUseImage( index ){

                const imageObj = this.previewImgs.uploadedAttachments[index];
                const url = `${imageObj.env === 'prod' ? process.env.OSS_SRC:process.env.OSS_SRC_TEMP}/${imageObj.key}`;

                this.postContent += `\n[img a='${imageObj.key}' w='100%']${url}[/img]`;
            }
        },
        components:{
            ResultView,
            Preview,
            ImageUpload,
            Attachments
        }
    }

</script>