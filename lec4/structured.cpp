#include <iostream>
#include <vector>
using namespace std;

bool is_even(int x) {
  return x % 2 == 0;
}

void sum_evens_structured(const vector<int> &data) {
  int sum = 0;
  for (int i = 0; i < data.size(); i++) {
    if (is_even(data[i])) {
      sum += data[i];
    } 
  }

  cout << "Total: " << sum << endl;
}

void sum_evens_non_structured(const vector<int> &data) {
  int sum = 0;
  int i = 0;

loop_start:
  if (i >= data.size()) goto loop_end;

  if (data[i] % 2 != 0) goto next_iteration;

  sum += data[i];

next_iteration:
  i++;
  goto loop_start;

loop_end:
  cout << "Total: " << sum << endl;
}

#include <iostream>
#include <vector>

int main() {
  vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
  vector<int> evenNumbers;

  // Imperative: We define the exact steps to find and store the data
  for (int i = 0; i < numbers.size(); ++i) {
      if (numbers[i] % 2 == 0) {
          evenNumbers.push_back(numbers[i]);
      }
  }

  // Output the results
  cout << "Even numbers: ";
  for (int n : evenNumbers) {
      cout << n << " ";
  }
  
  return 0;
}