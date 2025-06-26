
export default class GenericRepository {
    constructor(dao) {
        this.dao = dao;
    }

    getAll = (params) =>{
        return this.dao.get(params);
    }

    getBy = (params) =>{
        return this.dao.getBy(params);
    }

    getByLean = (params) =>{
        return this.dao.getBy(params).lean();
    }

    create = (doc) =>{
        return this.dao.save(doc);
    }

    update = (id,doc) =>{
        return this.dao.update(id,doc);
    }

    delete = (id) =>{
        return this.dao.delete(id);
    }
}