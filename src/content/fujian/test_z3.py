from z3 import *

a = BitVec('a', 8)
b = BitVec('b', 8)

s = Solver()
s.add(a + b == 100)
s.add(a == 40)

print(s.check())
print(s.model())