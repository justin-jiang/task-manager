import { actions as fileActions, mutations as fileMutations } from 'client/VuexOperations/FileOperations';
import { actions as sessionActions, mutations as sessionMutations, getters as sessionGetters } from 'client/VuexOperations/SessionOperations';
import { actions as templateActions, mutations as templateMutations } from 'client/VuexOperations/TemplateOperations';
import { actions as userActions, mutations as userMutations } from 'client/VuexOperations/UserOperations';
import { actions as taskActions, mutations as taskMutations } from 'client/VuexOperations/TaskOperations';
import { actions as notificationActions, mutations as notificationMutations } from 'client/VuexOperations/NotificationOperations';
import Vue from 'vue';
import Vuex, { ActionTree, MutationTree, GetterTree } from 'vuex';
import { IStoreState } from './VuexOperations/IStoreState';
import { UserView } from 'common/responseResults/UserView';
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
  taskMutations,
  notificationMutations,
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
  taskActions,
  notificationActions,
);
const getters: GetterTree<IStoreState, any> = {

};
Object.assign(getters, sessionGetters);

export const blankStoreState: IStoreState = {
  sessionInfo: new UserView(true),
  redirectURLAfterLogin: '',
  taskObjs: [],
  templateObjs: [],
  userObjs: [],
  notificationObjs: [],
  errorMessage: '',
}

/**
 * the data structure in Vuex(local memory)
 */
const state: IStoreState = Object.assign({}, blankStoreState);
Vue.use(Vuex);
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});
