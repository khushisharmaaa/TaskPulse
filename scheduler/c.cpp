#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <queue>
#include <stack>
#include <bitset>
#include <climits>
#include <cstring>
using namespace std;
#define ll long long 
#define lmax LLONG_MAX
#define lmin LLONG_MIN
#define imax INT_MAX
#define imin INT_MIN
#define _0ton for(int i=0;i<n;i++)
#define _1ton for(int i=1;i<=n;i++)
#define cin(t) int t;cin>>t;


int main()
{

    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin>>n;
    vector<int>v(n);
    for(int i=0;i<n;i++)cin>>v[i]; 
    int i=0;
    int j=0; 
    map<int,int>mp; 
    int mxlen = 0 ; 
    
    while(j<n){
        mp[v[j]]++;

        while(mp[v[j]]>=2){
             mp[v[i]]--; 
            i++; 
        }

        mxlen = max(mxlen , j-i+1); 
        j++;
    }

    cout<<mxlen<<endl; 
    return 0;
}
