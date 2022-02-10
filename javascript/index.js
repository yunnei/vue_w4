
import pagination from './pagination.js';

let productModal;
let delProductModal;

const baseUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'yunei';

const app = Vue.createApp({
    components: { pagination },
    data() {
        return {            
            products: [],
            isNew: true,
            productTemp: {
                imagesUrl: [],
            },
            pagination: {}
        };
    },
    methods: {
        checkLogin() {
            const url = `${baseUrl}/api/user/check`
            axios.post(url)
                .then(res => {
                    this.getProducts();
                })
                .catch(error => {
                    alert(error.data.message);
                    window.location = 'login.html';
                })
        },
        getProducts(page = 1) {
            const url = `${baseUrl}/api/${apiPath}/admin/products/?page=${page}`;
            axios.get(url)
                .then(res => {
                    this.products = res.data.products;
                    this.pagination = res.data.pagination;
                })
                .catch(error => {
                    console.log(error.data);
                })
        },        
        openModal(status, item) {
            if (status === 'new') {                
                this.productTemp = {
                    imagesUrl: [],
                };
                productModal.show();
                this.isNew = true;
            } else if (status === 'edit') {
                this.productTemp = JSON.parse(JSON.stringify(item));
                productModal.show();
                this.isNew = false;
            } else if (status === 'del') {
                this.productTemp = {...item};
                delProductModal.show();
            }
        },
        changeIsEnabled(item) {
            const url = `${baseUrl}/api/${apiPath}/admin/product/${item.id}`;
            axios.put(url, { data: item })
                .then(res => {
                    alert(res.data.message);
                    this.getProducts();
                })
                .catch(error => {
                    alert(error.data.message);
                })
        },
        toThousands(price) {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },
    mounted() {
        productModal = new bootstrap.Modal(document.getElementById('productModal'));
        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'));

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hextoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        axios.defaults.headers.common['Authorization'] = token;
        this.checkLogin();
    }
  });

// 新增、編輯產品 元件
app.component('productModal', {
    props: ['productTemp', 'isNew', 'currentPage'],
    template: '#productModal',
    methods: {
        updateProduct() {
            let url = `${baseUrl}/api/${apiPath}/admin/product/${this.productTemp.id}`;
            let http = 'put';
            if (this.isNew) {
                url = `${baseUrl}/api/${apiPath}/admin/product`;
                http = 'post';
            }
            axios[http](url, { data: this.productTemp })
                .then(res => {
                    alert(res.data.message);
                    productModal.hide();
                    this.$emit('getProduct', this.currentPage);
                })
                .catch(error => {
                    console.log(error)
                    // alert(error.data.message);
                })
        },
        createImages() {
            if (this.productTemp.imagesUrl) {
                this.productTemp.imagesUrl.push('');
            } else {
                this.productTemp.imagesUrl = [];
                this.productTemp.imagesUrl.push('');
            }            
        },
        uploadImage(isMain, e) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file-to-upload', file);
            
            let url = `${baseUrl}/api/${apiPath}/admin/upload`;
            axios.post(url, formData)
                .then(res => {
                    if (isMain) {
                        this.productTemp.imageUrl = res.data.imageUrl;
                    } else {                        
                        this.productTemp.imagesUrl[this.productTemp.imagesUrl.length-1] = res.data.imageUrl;
                    }                   
                    alert('圖片上傳成功');
                })
                .catch(error => {
                    console.log(error.response);
                })

        }
    }
})

// 刪除產品 元件
app.component('delModal', {
    props: ['productTemp'],
    template: '#delModal',
    methods: {
        delProduct() {
            const url = `${baseUrl}/api/${apiPath}/admin/product/${this.productTemp.id}`;
            axios.delete(url)
                .then(res => {
                    alert(res.data.message);
                    delProductModal.hide();
                    this.$emit('getProduct');
                })
                .catch(error => {
                    alert(error.data.message);
                })
        }
    }
})


app.mount("#app");
  