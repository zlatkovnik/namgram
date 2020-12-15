import { IPost } from "../../models/post"
import { CLEAR_POSTS, SET_POSTS, PostsActionTypes } from "./actions"

export interface PostsState{
    posts: IPost[]
}

const initialState: PostsState = {
    posts: []
}

export default (state = initialState, action: PostsActionTypes) => {
    switch(action.type){
        case SET_POSTS:
            return {...state, posts: action.payload}
        case CLEAR_POSTS:
            return {...state, loading: false}
        default:
            return {...state}
    }
}