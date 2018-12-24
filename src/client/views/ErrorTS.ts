import { Component, Vue } from 'vue-property-decorator';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class ErrorTS extends Vue {
    

    // #region Vue life-circle method
    private mounted(): void {
        // (async () => {
        //     await VueCompUtils.$$systemAdminCheck(this);
        //     const wikiName = await VueCompUtils.$$getWikiName(this);
        //     document.title = '一般配置-' + wikiName;
        //     const store = this.$store as Vuex.Store<IAdminStoreState>;
        //     if (store.state.loginUser.wikiLogo != null) {
        //         this.wikiLogoUrl = Utils.getImageURLById(store.state.loginUser.wikiLogo);
        //     }
        //     if (store.state.wikiProject.spaceDefaultLogo != null) {
        //         this.spaceDefaultLogoUrl = Utils.getImageURLById(store.state.loginUser.spaceDefaultLogo);
        //     } else {
        //         this.spaceDefaultLogoUrl = config.defaultAvatarForSpace;
        //     }
        //     this.isReadyToShowUI = true;
        // })().catch((ex) => {
        //     Utils.goToErrorComponent(this.$router, ex);
        // });
    }
    // #endregion


}
