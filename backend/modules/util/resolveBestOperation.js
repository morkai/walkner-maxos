// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function resolveBestOperation(operations)
{
  if (!Array.isArray(operations) || operations.length === 0)
  {
    return null;
  }

  if (operations.length === 1)
  {
    return operations[0];
  }

  return operations
    .map(function(op)
    {
      let rank = 0;

      if (op.laborTime > 0)
      {
        rank += 1;
      }

      if (op.workCenter)
      {
        rank += 1;
      }

      if (/mont/i.test(op.name))
      {
        rank += 2;
      }

      if (/pak/i.test(op.name))
      {
        rank += 1;
      }

      if (/kj/i.test(op.name))
      {
        rank += 1;
      }

      if (/opra/i.test(op.name))
      {
        rank += 1;
      }

      if (/z.o.en/i.test(op.name))
      {
        rank += 1;
      }

      return {
        op: op,
        rank: rank
      };
    })
    .sort(function(a, b) { return b.rank - a.rank; })
    .shift()
    .op;
};
