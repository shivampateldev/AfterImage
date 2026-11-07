import { CodeQuestion } from '../types';

export const CODING_QUESTIONS: CodeQuestion[] = [
  // --- PYTHON BEGINNER ---
  {
    id: 'py-01',
    language: 'python',
    topic: 'operators',
    difficulty: 'beginner',
    question: 'What is the output of this Python program?',
    codeSnippet: `x = 5
y = 3
print(x + y * 2)`,
    options: ['16', '11', '13', '10'],
    correctAnswerIndex: 1,
    explanation: 'Operator precedence in Python executes multiplication (*) before addition (+). Therefore, 3 * 2 = 6, followed by 5 + 6 = 11.',
    conceptSummary: 'Arithmetic operator precedence (* has higher priority than +)',
    rewardXp: 50,
  },
  {
    id: 'py-02',
    language: 'python',
    topic: 'strings',
    difficulty: 'beginner',
    question: 'What will this string slicing snippet print?',
    codeSnippet: `word = "AFTERIMAGE"
print(word[0:5])`,
    options: ['AFTER', 'AFTERI', 'FTERI', 'AFTERIM'],
    correctAnswerIndex: 0,
    explanation: 'Python string slicing [start:end] is half-open: it includes the index 0 up to, but not including, index 5 (indices 0,1,2,3,4: A-F-T-E-R).',
    conceptSummary: 'String indexing and end-exclusive slicing in Python',
    rewardXp: 50,
  },
  {
    id: 'py-03',
    language: 'python',
    topic: 'loops',
    difficulty: 'beginner',
    question: 'What is the total value of sum after the loop finishes?',
    codeSnippet: `total = 0
for i in range(1, 4):
    total += i
print(total)`,
    options: ['3', '6', '10', '4'],
    correctAnswerIndex: 1,
    explanation: 'range(1, 4) produces values 1, 2, and 3. The loop evaluates total = 0 + 1 + 2 + 3 = 6.',
    conceptSummary: 'for-loop iteration using range(start, stop)',
    rewardXp: 50,
  },
  {
    id: 'py-04',
    language: 'python',
    topic: 'conditionals',
    difficulty: 'beginner',
    question: 'What does this conditional snippet output?',
    codeSnippet: `echo_active = True
energy = 10
if echo_active and energy > 5:
    print("RECORDING_SYNCHRONIZED")
else:
    print("OFFLINE")`,
    options: ['OFFLINE', 'RECORDING_SYNCHRONIZED', 'None', 'Error'],
    correctAnswerIndex: 1,
    explanation: 'Both operands of the "and" logical operator are truthy: echo_active is True and energy (10) > 5 is True.',
    conceptSummary: 'Logical AND evaluation in Python conditionals',
    rewardXp: 50,
  },
  {
    id: 'py-05',
    language: 'python',
    topic: 'arrays',
    difficulty: 'beginner',
    question: 'What is the resulting length of the list?',
    codeSnippet: `echoes = ["Alpha", "Beta"]
echoes.append("Gamma")
echoes.pop(0)
print(len(echoes))`,
    options: ['1', '2', '3', '0'],
    correctAnswerIndex: 1,
    explanation: 'List starts with 2 elements, append adds 1 (making 3), and pop(0) removes the first element ("Alpha"), leaving 2 elements.',
    conceptSummary: 'List mutation using append() and pop()',
    rewardXp: 50,
  },
  {
    id: 'py-06',
    language: 'python',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'What does this function return?',
    codeSnippet: `def calibrate(level, multiplier=2):
    return level * multiplier

print(calibrate(4))`,
    options: ['4', '6', '8', 'TypeError'],
    correctAnswerIndex: 2,
    explanation: 'When calibrate(4) is called without the second argument, multiplier defaults to 2. Hence 4 * 2 = 8.',
    conceptSummary: 'Default argument parameters in Python functions',
    rewardXp: 50,
  },

  // --- PYTHON INTERMEDIATE ---
  {
    id: 'py-07',
    language: 'python',
    topic: 'recursion',
    difficulty: 'intermediate',
    question: 'What will this recursive countdown function print?',
    codeSnippet: `def echo_depth(n):
    if n <= 0:
        return 0
    return n + echo_depth(n - 1)

print(echo_depth(4))`,
    options: ['10', '4', '8', '12'],
    correctAnswerIndex: 0,
    explanation: 'echo_depth(4) = 4 + 3 + 2 + 1 + 0 = 10. The base case stops recursion at n <= 0.',
    conceptSummary: 'Recursive sum reduction with a base termination condition',
    rewardXp: 75,
  },
  {
    id: 'py-08',
    language: 'python',
    topic: 'complexity',
    difficulty: 'intermediate',
    question: 'What is the time complexity of checking membership in a Python set vs list on average?',
    options: ['O(1) for set, O(n) for list', 'O(n) for set, O(1) for list', 'O(n) for both', 'O(log n) for both'],
    correctAnswerIndex: 0,
    explanation: 'Sets are implemented using hash tables in Python, yielding average O(1) membership lookups, whereas lists require linear O(n) scans.',
    conceptSummary: 'Hash table lookup efficiency compared to sequential array scans',
    rewardXp: 75,
  },
  {
    id: 'py-09',
    language: 'python',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'What does this class inheritance snippet print?',
    codeSnippet: `class Entity:
    def type_name(self):
        return "Core"

class Echo(Entity):
    def type_name(self):
        return super().type_name() + "-Ghost"

print(Echo().type_name())`,
    options: ['Core', 'Ghost', 'Core-Ghost', 'AttributeError'],
    correctAnswerIndex: 2,
    explanation: 'super().type_name() calls the parent Entity method returning "Core", and appends "-Ghost" to yield "Core-Ghost".',
    conceptSummary: 'OOP Method overriding and calling super() methods in Python',
    rewardXp: 75,
  },
  {
    id: 'py-10',
    language: 'python',
    topic: 'algorithms',
    difficulty: 'intermediate',
    question: 'What does this list comprehension generate?',
    codeSnippet: `nums = [1, 2, 3, 4, 5]
evens = [x**2 for x in nums if x % 2 == 0]
print(evens)`,
    options: ['[4, 16]', '[2, 4]', '[1, 9, 25]', '[4, 8]'],
    correctAnswerIndex: 0,
    explanation: 'The filter selects even numbers: 2 and 4. The transformation squares each: 2**2 = 4 and 4**2 = 16.',
    conceptSummary: 'Python list comprehensions with conditional filtering and mapping',
    rewardXp: 75,
  },

  // --- JAVASCRIPT BEGINNER ---
  {
    id: 'js-01',
    language: 'javascript',
    topic: 'operators',
    difficulty: 'beginner',
    question: 'What is the result of typeof NaN in JavaScript?',
    codeSnippet: `console.log(typeof NaN);`,
    options: ['"number"', '"nan"', '"undefined"', '"null"'],
    correctAnswerIndex: 0,
    explanation: 'In the IEEE 754 floating point standard and JavaScript specification, NaN (Not-a-Number) is technically a numeric type.',
    conceptSummary: 'JavaScript type system quirks and typeof operator return types',
    rewardXp: 50,
  },
  {
    id: 'js-02',
    language: 'javascript',
    topic: 'conditionals',
    difficulty: 'beginner',
    question: 'What is logged by the equality check?',
    codeSnippet: `const a = "42";
const b = 42;
console.log(a === b);`,
    options: ['true', 'false', 'undefined', 'TypeError'],
    correctAnswerIndex: 1,
    explanation: 'The strict equality operator (===) checks both value and type without implicit type coercion. String !== Number.',
    conceptSummary: 'Strict equality (===) vs loose type coercion in JavaScript',
    rewardXp: 50,
  },
  {
    id: 'js-03',
    language: 'javascript',
    topic: 'arrays',
    difficulty: 'beginner',
    question: 'What does Array.prototype.map return here?',
    codeSnippet: `const samples = [10, 20, 30];
const doubled = samples.map(n => n * 2);
console.log(doubled);`,
    options: ['[20, 40, 60]', '[10, 20, 30]', 'undefined', '60'],
    correctAnswerIndex: 0,
    explanation: 'map() creates a new array populated with the results of calling the provided callback on every element.',
    conceptSummary: 'Functional transformation of arrays using .map()',
    rewardXp: 50,
  },
  {
    id: 'js-04',
    language: 'javascript',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'What is the output of the arrow function default parameter?',
    codeSnippet: `const record = (steps, limit = 5) => steps > limit;
console.log(record(7));`,
    options: ['true', 'false', '5', '7'],
    correctAnswerIndex: 0,
    explanation: 'steps is passed as 7, limit defaults to 5. 7 > 5 evaluates to true.',
    conceptSummary: 'ES6 arrow functions and default parameter evaluation',
    rewardXp: 50,
  },
  {
    id: 'js-05',
    language: 'javascript',
    topic: 'strings',
    difficulty: 'beginner',
    question: 'What is the output of template literal interpolation?',
    codeSnippet: `const facility = "Omega";
const floor = 4;
console.log(\`Sector-\${facility}-\${floor * 10}\`);`,
    options: ['Sector-Omega-40', 'Sector-${facility}-40', 'Sector-Omega-4', 'SyntaxError'],
    correctAnswerIndex: 0,
    explanation: 'Template literals backticks allow expressions inside \${...} which are evaluated and converted to strings.',
    conceptSummary: 'ES6 template string interpolation and inline expressions',
    rewardXp: 50,
  },
  {
    id: 'js-06',
    language: 'javascript',
    topic: 'variables',
    difficulty: 'beginner',
    question: 'What occurs when reassigning a const variable?',
    codeSnippet: `const echoId = "ECHO_01";
echoId = "ECHO_02";`,
    options: ['TypeError: Assignment to constant variable', 'Variable is reassigned', 'undefined', 'Silent pass in non-strict mode'],
    correctAnswerIndex: 0,
    explanation: 'Variables declared with const cannot be reassigned through reassignment operators and throw a TypeError.',
    conceptSummary: 'const immutability of binding identifier reassignment',
    rewardXp: 50,
  },

  // --- JAVASCRIPT INTERMEDIATE ---
  {
    id: 'js-07',
    language: 'javascript',
    topic: 'functions',
    difficulty: 'intermediate',
    question: 'What will this closure print?',
    codeSnippet: `function makeEchoCounter() {
    let count = 0;
    return () => ++count;
}
const count = makeEchoCounter();
count();
console.log(count());`,
    options: ['1', '2', '3', '0'],
    correctAnswerIndex: 1,
    explanation: 'The returned function retains a lexical reference (closure) over count. The first invocation increments count to 1, the second to 2.',
    conceptSummary: 'Lexical scoping and closures in JavaScript',
    rewardXp: 75,
  },
  {
    id: 'js-08',
    language: 'javascript',
    topic: 'algorithms',
    difficulty: 'intermediate',
    question: 'What will this Promise execution order log?',
    codeSnippet: `console.log("A");
Promise.resolve().then(() => console.log("B"));
console.log("C");`,
    options: ['A, C, B', 'A, B, C', 'B, A, C', 'C, A, B'],
    correctAnswerIndex: 0,
    explanation: 'Synchronous statements "A" and "C" run immediately on the call stack. The Promise microtask callback ("B") runs after the synchronous code concludes.',
    conceptSummary: 'JavaScript Event Loop: Call stack execution vs Microtask queue',
    rewardXp: 75,
  },
  {
    id: 'js-09',
    language: 'javascript',
    topic: 'arrays',
    difficulty: 'intermediate',
    question: 'What does Array.prototype.reduce evaluate to here?',
    codeSnippet: `const weights = [2, 4, 6];
const sum = weights.reduce((acc, curr) => acc + curr, 10);
console.log(sum);`,
    options: ['12', '22', '10', '24'],
    correctAnswerIndex: 1,
    explanation: 'The initial accumulator is 10. The reduction runs: 10 + 2 = 12, 12 + 4 = 16, 16 + 6 = 22.',
    conceptSummary: 'Array.prototype.reduce with initial value accumulation',
    rewardXp: 75,
  },
  {
    id: 'js-10',
    language: 'javascript',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'What does the spread operator (...) do here?',
    codeSnippet: `const base = { hp: 100, shield: 50 };
const buffed = { ...base, shield: 80 };
console.log(buffed.shield);`,
    options: ['50', '80', '130', 'undefined'],
    correctAnswerIndex: 1,
    explanation: 'The object spread copies properties from base, but the subsequent shield: 80 overrides the earlier value with 80.',
    conceptSummary: 'Object shallow copy and property override using object spread syntax',
    rewardXp: 75,
  },

  // --- C PROGRAMMING BEGINNER ---
  {
    id: 'c-01',
    language: 'c',
    topic: 'conditionals',
    difficulty: 'beginner',
    question: 'What will be printed by this C program?',
    codeSnippet: `#include <stdio.h>

int main() {
    int x = 10;
    if (x > 5) {
        printf("YES");
    } else {
        printf("NO");
    }
    return 0;
}`,
    options: ['YES', 'NO', 'Compilation Error', 'Nothing'],
    correctAnswerIndex: 0,
    explanation: 'x is 10, which is strictly greater than 5. The if branch evaluates to true (1) and executes printf("YES").',
    conceptSummary: 'Basic conditional branching with if-else in C',
    rewardXp: 50,
  },
  {
    id: 'c-02',
    language: 'c',
    topic: 'operators',
    difficulty: 'beginner',
    question: 'What is the output of integer division in C?',
    codeSnippet: `#include <stdio.h>

int main() {
    int a = 7;
    int b = 2;
    printf("%d", a / b);
    return 0;
}`,
    options: ['3.5', '3', '4', '0'],
    correctAnswerIndex: 1,
    explanation: 'Division between two integers in C performs integer truncation towards zero. 7 / 2 evaluates to 3.',
    conceptSummary: 'Integer truncation during division in C',
    rewardXp: 50,
  },
  {
    id: 'c-03',
    language: 'c',
    topic: 'loops',
    difficulty: 'beginner',
    question: 'How many times does this while loop execute?',
    codeSnippet: `int count = 3;
while (count > 0) {
    count--;
}`,
    options: ['3 times', '4 times', '2 times', 'Infinite'],
    correctAnswerIndex: 0,
    explanation: 'The loop executes for count = 3, 2, and 1 (3 times). When count becomes 0, 0 > 0 is false and the loop terminates.',
    conceptSummary: 'While loop condition evaluation and decrement loops',
    rewardXp: 50,
  },
  {
    id: 'c-04',
    language: 'c',
    topic: 'arrays',
    difficulty: 'beginner',
    question: 'What is printed by accessing index 2?',
    codeSnippet: `int frames[4] = {10, 20, 30, 40};
printf("%d", frames[2]);`,
    options: ['20', '30', '10', '40'],
    correctAnswerIndex: 1,
    explanation: 'C arrays are 0-indexed: index 0 is 10, index 1 is 20, index 2 is 30.',
    conceptSummary: 'Zero-based array indexing in C',
    rewardXp: 50,
  },
  {
    id: 'c-05',
    language: 'c',
    topic: 'variables',
    difficulty: 'beginner',
    question: 'What format specifier is used for printing a floating-point number in printf?',
    options: ['%f', '%d', '%s', '%c'],
    correctAnswerIndex: 0,
    explanation: '%f is used for standard float (and promoted double) values in printf, while %d is for integers and %s is for strings.',
    conceptSummary: 'Standard I/O format specifiers in C',
    rewardXp: 50,
  },
  {
    id: 'c-06',
    language: 'c',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'What is the return type of a C function that does not return any value?',
    options: ['void', 'null', 'empty', 'int'],
    correctAnswerIndex: 0,
    explanation: 'The void keyword specifies that a function returns no value to its caller.',
    conceptSummary: 'Void return type in C functions',
    rewardXp: 50,
  },

  // --- C PROGRAMMING INTERMEDIATE ---
  {
    id: 'c-07',
    language: 'c',
    topic: 'pointers',
    difficulty: 'intermediate',
    question: 'What value is printed through pointer dereferencing?',
    codeSnippet: `int val = 25;
int *ptr = &val;
*ptr = 50;
printf("%d", val);`,
    options: ['25', '50', 'Address of val', 'Garbage value'],
    correctAnswerIndex: 1,
    explanation: 'ptr stores the memory address of val (&val). Dereferencing *ptr = 50 assigns 50 directly to the memory address occupied by val.',
    conceptSummary: 'Memory addresses and pointer dereferencing in C',
    rewardXp: 75,
  },
  {
    id: 'c-08',
    language: 'c',
    topic: 'pointers',
    difficulty: 'intermediate',
    question: 'What is sizeof(ptr) on a standard 64-bit architecture?',
    codeSnippet: `char *ptr = "ECHO";`,
    options: ['8 bytes', '4 bytes', '5 bytes', '1 byte'],
    correctAnswerIndex: 0,
    explanation: 'On a 64-bit platform, any pointer holds a 64-bit memory address, which occupies 8 bytes regardless of the pointed data type.',
    conceptSummary: 'Pointer sizes across architecture bit widths',
    rewardXp: 75,
  },
  {
    id: 'c-09',
    language: 'c',
    topic: 'strings',
    difficulty: 'intermediate',
    question: 'What character marks the end of a C string?',
    options: ['\\0 (null terminator)', '\\n (newline)', 'EOF', 'Space'],
    correctAnswerIndex: 0,
    explanation: 'In C, strings are null-terminated character arrays ending with the byte value 0, written as "\\0".',
    conceptSummary: 'Null-terminated string convention in C',
    rewardXp: 75,
  },
  {
    id: 'c-10',
    language: 'c',
    topic: 'recursion',
    difficulty: 'intermediate',
    question: 'What does this recursive function return for fib(4)?',
    codeSnippet: `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
    options: ['3', '2', '5', '4'],
    correctAnswerIndex: 0,
    explanation: 'fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3.',
    conceptSummary: 'Recursive tree evaluation of Fibonacci numbers',
    rewardXp: 75,
  },

  // --- C++ BEGINNER ---
  {
    id: 'cpp-01',
    language: 'cpp',
    topic: 'variables',
    difficulty: 'beginner',
    question: 'Which header file is required for std::cout and std::cin?',
    options: ['<iostream>', '<stdio.h>', '<stream>', '<output>'],
    correctAnswerIndex: 0,
    explanation: '<iostream> provides the basic stream definitions for standard character input and output.',
    conceptSummary: 'Standard C++ Stream I/O headers',
    rewardXp: 50,
  },
  {
    id: 'cpp-02',
    language: 'cpp',
    topic: 'operators',
    difficulty: 'beginner',
    question: 'What does the scope resolution operator look like in C++?',
    options: ['::', '->', '.', ':'],
    correctAnswerIndex: 0,
    explanation: 'The double colon (::) is the scope resolution operator used to identify and qualify symbols declared in different scopes or namespaces.',
    conceptSummary: 'Scope resolution operator in C++',
    rewardXp: 50,
  },
  {
    id: 'cpp-03',
    language: 'cpp',
    topic: 'conditionals',
    difficulty: 'beginner',
    question: 'What does this ternary operator expression evaluate to?',
    codeSnippet: `int echoes = 3;
std::string status = (echoes > 0) ? "ACTIVE" : "STANDBY";`,
    options: ['"ACTIVE"', '"STANDBY"', 'Compilation error', 'true'],
    correctAnswerIndex: 0,
    explanation: 'Since echoes (3) > 0 evaluates to true, the expression evaluates to the value following ?, which is "ACTIVE".',
    conceptSummary: 'Ternary conditional expressions',
    rewardXp: 50,
  },
  {
    id: 'cpp-04',
    language: 'cpp',
    topic: 'arrays',
    difficulty: 'beginner',
    question: 'What standard library dynamic array container automatically handles resizing?',
    options: ['std::vector', 'std::array', 'std::list', 'std::queue'],
    correctAnswerIndex: 0,
    explanation: 'std::vector represents a contiguous dynamic array that manages its own memory and grows as elements are inserted.',
    conceptSummary: 'C++ STL std::vector dynamic resizing',
    rewardXp: 50,
  },
  {
    id: 'cpp-05',
    language: 'cpp',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'What happens when a parameter is passed by reference (int &val)?',
    options: [
      'The function works directly on the original caller variable without making a copy',
      'A deep copy of the integer is created',
      'The variable becomes read-only',
      'It produces a compilation error in modern C++'
    ],
    correctAnswerIndex: 0,
    explanation: 'Passing by reference binds an alias to the original variable without copying its value.',
    conceptSummary: 'Pass-by-reference mechanics in C++',
    rewardXp: 50,
  },
  {
    id: 'cpp-06',
    language: 'cpp',
    topic: 'loops',
    difficulty: 'beginner',
    question: 'What does a range-based for loop iterate over?',
    codeSnippet: `std::vector<int> v = {1, 2, 3};
for (int x : v) {
    // ...
}`,
    options: ['Every element in vector v', 'The indices 0, 1, 2', 'A pointer to v', 'Only the first element'],
    correctAnswerIndex: 0,
    explanation: 'The range-based for loop introduced in C++11 iterates directly over each element of an iterable container.',
    conceptSummary: 'C++11 range-based for loops',
    rewardXp: 50,
  },

  // --- C++ INTERMEDIATE ---
  {
    id: 'cpp-07',
    language: 'cpp',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'What keyword enables polymorphic dynamic dispatch for member methods in C++?',
    options: ['virtual', 'override', 'abstract', 'dynamic'],
    correctAnswerIndex: 0,
    explanation: 'The virtual keyword in the base class ensures method resolution is handled dynamically at runtime via the vtable.',
    conceptSummary: 'Virtual functions and runtime polymorphism in C++',
    rewardXp: 75,
  },
  {
    id: 'cpp-08',
    language: 'cpp',
    topic: 'pointers',
    difficulty: 'intermediate',
    question: 'Which smart pointer in <memory> guarantees exclusive single ownership of a resource?',
    options: ['std::unique_ptr', 'std::shared_ptr', 'std::weak_ptr', 'std::auto_ptr'],
    correctAnswerIndex: 0,
    explanation: 'std::unique_ptr enforces sole ownership of an allocated object and automatically destructs it when it falls out of scope.',
    conceptSummary: 'RAII and smart pointer ownership semantics',
    rewardXp: 75,
  },
  {
    id: 'cpp-09',
    language: 'cpp',
    topic: 'complexity',
    difficulty: 'intermediate',
    question: 'What is the average search complexity of std::map (implemented as a Red-Black Tree)?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correctAnswerIndex: 0,
    explanation: 'std::map is typically implemented as a balanced binary search tree (Red-Black tree), giving guaranteed O(log n) lookup, insertion, and deletion.',
    conceptSummary: 'Balanced tree complexity in C++ std::map',
    rewardXp: 75,
  },
  {
    id: 'cpp-10',
    language: 'cpp',
    topic: 'algorithms',
    difficulty: 'intermediate',
    question: 'What does std::move do to an object?',
    options: [
      'Casts the lvalue to an rvalue reference to allow moving resources without copying',
      'Physically moves bytes to another memory location',
      'Deletes the object immediately',
      'Creates a concurrent worker thread'
    ],
    correctAnswerIndex: 0,
    explanation: 'std::move performs an unconditional cast to an rvalue reference (T&&), signaling that the object\'s resources can be stolen/transferred.',
    conceptSummary: 'C++ Move semantics and rvalue reference conversion',
    rewardXp: 75,
  },

  // --- JAVA BEGINNER ---
  {
    id: 'java-01',
    language: 'java',
    topic: 'variables',
    difficulty: 'beginner',
    question: 'What is the default value of an uninitialized boolean instance variable in Java?',
    options: ['false', 'true', 'null', '0'],
    correctAnswerIndex: 0,
    explanation: 'Java automatically initializes instance boolean variables to false by default.',
    conceptSummary: 'Default field initialization in Java',
    rewardXp: 50,
  },
  {
    id: 'java-02',
    language: 'java',
    topic: 'operators',
    difficulty: 'beginner',
    question: 'How do you check for string value equality in Java?',
    options: ['str1.equals(str2)', 'str1 == str2', 'str1 === str2', 'equals(str1, str2)'],
    correctAnswerIndex: 0,
    explanation: 'In Java, == compares memory references for objects. To compare character content, .equals() must be used.',
    conceptSummary: 'Reference identity (==) vs semantic equality (.equals) in Java',
    rewardXp: 50,
  },
  {
    id: 'java-03',
    language: 'java',
    topic: 'arrays',
    difficulty: 'beginner',
    question: 'How do you obtain the number of elements in a standard Java array?',
    options: ['arr.length', 'arr.length()', 'arr.size()', 'arr.count'],
    correctAnswerIndex: 0,
    explanation: 'In Java, array length is an immutable public final property (arr.length), not a method.',
    conceptSummary: 'Java array property vs Collection.size() method',
    rewardXp: 50,
  },
  {
    id: 'java-04',
    language: 'java',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'What is the exact signature of the entry method in any Java application?',
    options: [
      'public static void main(String[] args)',
      'public void main(String[] args)',
      'static void main()',
      'public int main(String args)'
    ],
    correctAnswerIndex: 0,
    explanation: 'The JVM requires public static void main(String[] args) as the recognized entry point for standalone programs.',
    conceptSummary: 'JVM entry point method signatures',
    rewardXp: 50,
  },
  {
    id: 'java-05',
    language: 'java',
    topic: 'conditionals',
    difficulty: 'beginner',
    question: 'What is printed by this switch statement?',
    codeSnippet: `int level = 2;
switch(level) {
    case 1: System.out.print("A");
    case 2: System.out.print("B");
    case 3: System.out.print("C");
        break;
    default: System.out.print("D");
}`,
    options: ['BC', 'B', 'BCD', 'C'],
    correctAnswerIndex: 0,
    explanation: 'Because case 2 lacks a break statement, fall-through occurs into case 3, printing "B" followed by "C" before reaching break.',
    conceptSummary: 'Switch statement fall-through behavior without break',
    rewardXp: 50,
  },
  {
    id: 'java-06',
    language: 'java',
    topic: 'loops',
    difficulty: 'beginner',
    question: 'How does an enhanced for-loop work in Java?',
    codeSnippet: `int[] scores = {80, 90, 100};
for (int s : scores) { ... }`,
    options: ['Iterates sequentially through values in scores', 'Iterates through index indices', 'Modifies original array elements in place', 'Runs in reverse'],
    correctAnswerIndex: 0,
    explanation: 'The for-each enhanced loop iterates over each value in an array or Iterable collection in order.',
    conceptSummary: 'Java enhanced for-each iteration',
    rewardXp: 50,
  },

  // --- JAVA INTERMEDIATE ---
  {
    id: 'java-07',
    language: 'java',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'Can a class in Java extend multiple superclasses directly?',
    options: ['No, Java supports single class inheritance only', 'Yes, using commas', 'Yes, up to 3 classes', 'Only if they are abstract'],
    correctAnswerIndex: 0,
    explanation: 'Java permits a class to extend only one superclass to prevent diamond-problem ambiguity, although it may implement multiple interfaces.',
    conceptSummary: 'Single inheritance principle in Java class hierarchy',
    rewardXp: 75,
  },
  {
    id: 'java-08',
    language: 'java',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'What is the purpose of the final keyword when applied to a class?',
    options: ['Prevents other classes from extending/subclassing it', 'Makes all its methods run faster', 'Makes all its fields mutable', 'Allows garbage collection instantly'],
    correctAnswerIndex: 0,
    explanation: 'Declaring a class final in Java prevents it from being extended by any other class (like java.lang.String).',
    conceptSummary: 'final keyword semantics on Java classes',
    rewardXp: 75,
  },
  {
    id: 'java-09',
    language: 'java',
    topic: 'algorithms',
    difficulty: 'intermediate',
    question: 'What interface must an object implement to be sorted naturally using Collections.sort()?',
    options: ['Comparable<T>', 'Comparator<T>', 'Sortable', 'Cloneable'],
    correctAnswerIndex: 0,
    explanation: 'Classes implementing Comparable<T> define the compareTo(T o) method, establishing their natural ordering.',
    conceptSummary: 'Comparable interface and natural sort ordering in Java',
    rewardXp: 75,
  },
  {
    id: 'java-10',
    language: 'java',
    topic: 'complexity',
    difficulty: 'intermediate',
    question: 'What is the worst-case time complexity of inserting into an ArrayList when internal resizing is triggered?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
    correctAnswerIndex: 0,
    explanation: 'While amortized insertion into an ArrayList is O(1), when capacity is exceeded, an array reallocation and element copy costs O(n) worst-case.',
    conceptSummary: 'Amortized O(1) vs worst-case O(n) array resizing complexity',
    rewardXp: 75,
  },

  // --- ADDITIONAL COMPREHENSIVE CHALLENGES (TOPIC EXPANSION) ---
  {
    id: 'py-11',
    language: 'python',
    topic: 'loops',
    difficulty: 'beginner',
    question: 'What is the output of this loop with a break statement?',
    codeSnippet: `for i in range(5):
    if i == 2:
        break
    print(i, end=" ")`,
    options: ['0 1 ', '0 1 2 ', '0 1 2 3 4 ', '2 '],
    correctAnswerIndex: 0,
    explanation: 'When i reaches 2, the break statement immediately terminates the loop before printing 2, printing only "0 1 ".',
    conceptSummary: 'Early loop termination using break',
    rewardXp: 50,
  },
  {
    id: 'py-12',
    language: 'python',
    topic: 'arrays',
    difficulty: 'intermediate',
    question: 'What will dict.get("missing", 0) return if the key does not exist?',
    options: ['0', 'None', 'KeyError', 'False'],
    correctAnswerIndex: 0,
    explanation: 'dict.get(key, default) safely returns the provided default value (0) instead of raising a KeyError when the key is absent.',
    conceptSummary: 'Safe dictionary value access with defaults',
    rewardXp: 75,
  },
  {
    id: 'c-11',
    language: 'c',
    topic: 'pointers',
    difficulty: 'intermediate',
    question: 'What is the consequence of forgetting to free() dynamically allocated heap memory in C?',
    options: ['Memory leak', 'Segmentation fault immediately', 'Stack overflow', 'Buffer underflow'],
    correctAnswerIndex: 0,
    explanation: 'Failing to release dynamically allocated memory via free() causes the memory to remain reserved until process exit, known as a memory leak.',
    conceptSummary: 'Manual dynamic memory management and memory leaks in C',
    rewardXp: 75,
  },
  {
    id: 'js-11',
    language: 'javascript',
    topic: 'variables',
    difficulty: 'beginner',
    question: 'What is the output of the nullish coalescing operator (??)?',
    codeSnippet: `const recorded = null ?? "DEFAULT_ECHO";
console.log(recorded);`,
    options: ['"DEFAULT_ECHO"', 'null', 'undefined', 'TypeError'],
    correctAnswerIndex: 0,
    explanation: 'The ?? operator returns the right-hand operand when the left-hand operand is null or undefined.',
    conceptSummary: 'Nullish coalescing (??) evaluation in modern JavaScript',
    rewardXp: 50,
  },
  {
    id: 'cpp-11',
    language: 'cpp',
    topic: 'oop',
    difficulty: 'intermediate',
    question: 'What is RAII (Resource Acquisition Is Initialization) primarily used for in C++?',
    options: [
      'Binding lifecycle of resources (memory, handles) to object lifetime and scope destructors',
      'Speeding up compilation times',
      'Enabling network streaming',
      'Forcing all functions to be inline'
    ],
    correctAnswerIndex: 0,
    explanation: 'RAII guarantees that resource acquisition occurs in constructors and release occurs deterministically in destructors when scope ends.',
    conceptSummary: 'Deterministic resource management via RAII pattern',
    rewardXp: 75,
  },
  {
    id: 'java-11',
    language: 'java',
    topic: 'functions',
    difficulty: 'beginner',
    question: 'Can two methods in the same class have the same name in Java?',
    options: [
      'Yes, if their parameter lists (types/count) differ (Method Overloading)',
      'No, duplicate method names are never allowed',
      'Only if their return types differ',
      'Only in interface classes'
    ],
    correctAnswerIndex: 0,
    explanation: 'Method overloading allows methods to share the same name as long as their parameter signatures are distinct.',
    conceptSummary: 'Method Overloading compile-time polymorphism',
    rewardXp: 50,
  }
];

