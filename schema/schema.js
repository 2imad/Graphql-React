const axios = require('axios');
const graphql = require('graphql');

const {
 GraphQLObjectType,
 GraphQLString,
 GraphQLInt,
 GraphQLSchema,
 GraphQLList,
 GraphQLNonNull
} = graphql;


const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString},
    name: { type: GraphQLString},
    description: { type: GraphQLString},
    users: {
      // instructing graphql to expect a list of results from the query
      type: new GraphQLList(UserType),
      resolve(parentValue , args){
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        .then(resp => resp.data)
      }
    }
  })
});

const UserType = new GraphQLObjectType({  
  name: 'User',
  fields: () => ({
      id: { type: GraphQLString}, 
      firstName: { type: GraphQLString },
      age: { type: GraphQLInt },
      company: {
        type: CompanyType,
        resolve(parentValue, args){
         return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data)
          
        }
      }
  }) 
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
   user: {
     type: UserType,
     args: {id: { type: GraphQLString} },
     resolve(parentValue, args) {
      return axios.get(`http://localhost:3000/users/${args.id}`)
      .then(resp => resp.data)
     }
    },
    company: {
      type: CompanyType,
      args: { id: {type: GraphQLString} },
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/companies/${args.id}`)
        .then(res => res.data)
      }
    }   
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      // destructure firstName and age from the args object
      resolve(parentValue, {firstName, age, companyId}) {
        return axios.post('http://localhost:3000/users', {firstName, age, companyId})
        .then(resp => resp.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: {type: GraphQLString}
      },
      resolve(parentValue, args){
        return axios.delete(`http://localhost:3000/users/${args.id}`, args.id)
         .then(resp => resp.data)
      }
    }
  }
});

module.exports = new GraphQLSchema({
 query: RootQuery,
 mutation
})


