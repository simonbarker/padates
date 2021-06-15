# notes

This was pretty challenging, I feel like I missed some simpler algorithm to do this I tried two approaches and settled on bringing everything down to ms to provide a base unit which makes many things easier but makes months significantly harder as it's not a fixed unit of time and is relative to NOW().

I've sort of implemented leap years but it's not fully tested and would need more work doing to it.

I would also refactor the large switch statements used in `roundDate` and `convertDateMutationToSeconds` as they are pretty gross. The tests are halfway between TDD and characterisation tests.

I'm keen to get feedback on this as like it say, I can't help but feel I missed a simpler solution.

# install

`npm i`

# start

`npm start`

# test

`npm test`
