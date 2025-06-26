
import GenericRepository from "./GenericRepository.js";

export default class UserRepository extends GenericRepository{
    constructor(dao){
        super(dao);
    }
    
    getUserByEmail = (email) =>{
        return this.getBy({email});
    }

    getUserByEmailLean = (email) =>{
        return this.getByLean({email});
    }

    getUserById = (id) =>{
        return this.getBy({_id:id})
    }
    
}