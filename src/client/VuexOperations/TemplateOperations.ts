import axios from 'axios';
import { HttpPathItem } from 'common/HttpPathItem';
import { Commit } from 'vuex';
import { HttpUtils } from './HttpUtils';
import { IStoreActionArgs } from './IStoreActionArgs';
import { StoreActionNames } from './StoreActionNames';
export const actions = {

    /**
     * get templates by conditions
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.templateQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.QUERY}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
    async [StoreActionNames.templateRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.REMOVE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
    async [StoreActionNames.templateEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.EDIT}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
};

export const mutations = {

};
