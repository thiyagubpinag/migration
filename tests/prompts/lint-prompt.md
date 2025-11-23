# Lint Prompt Test

This is a sample prompt for testing the lint tool.

## Task
Review the following code for quality issues:

```javascript
function badCode() {
  var unused = 10;
  let x=5+3;
  if(x==8){
    console.log("equals")
  }
  return x
}
```

## Expected Output
- Identify code quality issues
- Suggest improvements
- Provide best practices