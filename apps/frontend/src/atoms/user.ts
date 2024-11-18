import axios from 'axios'
import { atom, selector } from 'recoil'
import { USER_BACKEND_URL } from '../config/config'

export const userAtom = atom({
    key: 'userAtom',
    default: selector({
        key: 'userSelector',
        get: async () => {
            try {
                const response = await axios.get(`${USER_BACKEND_URL}/api/v1/user/refresh`, {
                    withCredentials: true
                })
                if(response.data.success){
                    return response.data
                }
            } catch(error){
                throw `Error getting user: ${error}`
            }
            return null
        }
    })
})