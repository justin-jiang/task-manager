import { actions as fileActions, mutations as fileMutations } from 'client/VuexOperations/FileOperations';
import { actions as sessionActions, mutations as sessionMutations } from 'client/VuexOperations/SessionOperations';
import { actions as templateActions, mutations as templateMutations } from 'client/VuexOperations/TemplateOperations';
import { actions as userActions, mutations as userMutations } from 'client/VuexOperations/UserOperations';
import Vue from 'vue';
import Vuex, { ActionTree, MutationTree } from 'vuex';
import { IStoreState } from './VuexOperations/IStoreState';
/**
 * Mutation Methods invoked by Actions to update the data in client memory
 */
const mutations: MutationTree<IStoreState> = {
};
Object.assign(
  mutations,
  userMutations,
  fileMutations,
  sessionMutations,
  templateMutations,
);

/**
 * Actions Methods invoked by Vue Component to sync with server data and then invoke
 * mutation methods to sync the local memory data
 */
const actions: ActionTree<IStoreState, any> = {
};
Object.assign(
  actions,
  userActions,
  fileActions,
  sessionActions,
  templateActions,
);

/**
 * the data structure in Vuex(local memory)
 */
const state: IStoreState = {
  sessionInfo: undefined,
  redirectURLAfterLogin: undefined,
};

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
