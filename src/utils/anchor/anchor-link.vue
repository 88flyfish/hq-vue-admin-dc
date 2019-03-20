<template>
    <div :class="anchorLinkClasses" class='anchor_li'>
        <a :class="linkTitleClasses" :href="href" :data-scroll-offset="scrollOffset" :data-href="href" @click.prevent="goAnchor" :title="title">{{ title }}</a>
        <slot></slot>
    </div>
</template>
<script>
    export default {
        name: 'AnchorLink',
        inject: ['anchorCom'],
        props: {
            href: String,
            title: String,
            scrollOffset: {
                type: Number,
                default() {
                    return this.anchorCom.scrollOffset;
                }
            }
        },
        data() {
            return {
                prefix: 'ivu-anchor-link'
            };
        },
        computed: {
            anchorLinkClasses() {
                return [
                    this.prefix,
                    this.anchorCom.currentLink === this.href ? `${this.prefix}-active` : ''
                ];
            },
            linkTitleClasses() {
                return [
                    `${this.prefix}-title`
                ];
            }
        },
        methods: {
            goAnchor() {
                this.currentLink = this.href;
                this.anchorCom.handleHashChange();
                this.anchorCom.handleScrollTo();
                this.anchorCom.$emit('on-select', this.href);
                const isRoute = this.$router;
                if(isRoute) {
                    this.$router.push(this.href);
                } else {
                    window.location.href = this.href;
                }
            },
        },
        mounted() {
            this.$nextTick(() => {
                this.anchorCom.init();
            });
        }
    };
</script>

<style lang="scss">
    .anchor_li {
        height: 30px;
        line-height: 30px;
        
        &:hover{
            color: #2d8cf0;
        }
    }
    
    .ivu-anchor .ivu-anchor-link-active{
        color: #2d8cf0;
    }
</style>