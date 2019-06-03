function makeDogPostArray() {
    return [
        {
            id: 1,
            dog_name: "Jax",
            email: "armanbhimani99@gmail.com",
            breed: "Maltipoo",
            birthdate: "2018-06-18",
            lifestyle: "Small dog that loves to run around. Will fit well in smaller homes as well as larger homes. Will need atleast an hour of exercise to keep out of trouble.",
            owner: 1
        },
        {
            id: 2,
            dog_name: "Nova",
            email: "armannbhhimani99@gmail.com",
            breed: "Teddy Bear",
            birthdate: "2018-09-18",
            lifestyle: "Small dog that is always relaxed and ready to play at all times. However he is super relaxed and also likes to cuddle up with his family.",
            owner: 1
        },
        {
            id: 3,
            dog_name: "Harley",
            email: "armanibhimani99@gmail.com",
            breed: "German Sheperd Mix",
            birthdate: "2016-02-14",
            lifestyle: "Big dog that needs a big yard. He needs plenty of exercise to keep him out of trouble and healthy. He will do well with experienced owners.",
            owner: 2
        }
    ]
}


function makeMaliciousPost() {
    const maliciousPost = {
        id: 911,
        dog_name: "Nova <script>alert('xss');</script>",
        email: "sometingbad@gmail.com <script>alert('xss')</script>",
        breed: "German Sheperd <script>alert('xss')</script>",
        birthdate: "2019-03-21",
        lifestyle: `Big dog with a lot of energy <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        owner: 1
    };
    const expectedPost = {
      ...maliciousPost,
        dog_name: "Nova <script>alert('xss');</script>",
        email: "sometingbad@gmail.com <script>alert('xss')</script>",
        breed: "German Sheperd <script>alert('xss')</script>",
        lifestyle: `Big dog with lots of energy <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        owner: 1
    };
    return {
        maliciousPost,
        expectedPost
    };
  }

  module.exports = {
      makeDogPostArray,
      makeMaliciousPost
  }