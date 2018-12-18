import Vue from 'vue';
import Vuex, { MutationTree, ActionTree } from 'vuex';
import { IAdminStoreState } from './VuexOperations/IStoreState';
import { mutations as userMutations, actions as userActions } from '@/client/VuexOperations/userOperations';
import { mutations as fileMutations, actions as fileActions } from '@/client/VuexOperations/fileOperations';
/**
 * Mutation Methods invoked by Actions to update the data in client memory
 */
const mutations: MutationTree<IAdminStoreState> = {
};
Object.assign(
  mutations,
  userMutations,
  fileMutations);

/**
 * Actions Methods invoked by Vue Component to sync with server data and then invoke
 * mutation methods to sync the local memory data
 */
const actions: ActionTree<IAdminStoreState, any> = {
};
Object.assign(
  actions,
  userActions,
  fileActions);

/**
 * the data structure in Vuex(local memory)
 */
const state: IAdminStoreState = {
  loginUser: undefined,
  selectedUser: undefined,
  userList: [],
};

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
